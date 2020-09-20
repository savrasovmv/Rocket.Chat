import { ServiceBroker, Context, ServiceSchema, Serializers } from 'moleculer';
import EJSON from 'ejson';

import { asyncLocalStorage, License } from '../../server/sdk';
import { api } from '../../server/sdk/api';
import { IBroker, IBrokerNode } from '../../server/sdk/types/IBroker';
import { ServiceClass } from '../../server/sdk/types/ServiceClass';
import { EventSignatures } from '../../server/sdk/lib/Events';
import { LocalBroker } from '../../server/sdk/lib/LocalBroker';

const events: {[k: string]: string} = {
	onNodeConnected: '$node.connected',
	onNodeUpdated: '$node.updated',
	onNodeDisconnected: '$node.disconnected',
};

const lifecycle: {[k: string]: string} = {
	created: 'created',
	started: 'started',
	stopped: 'stopped',
};

class NetworkBroker implements IBroker {
	private broker: ServiceBroker;

	private localBroker = new LocalBroker();

	private allowed = false;

	private whitelist = {
		events: ['license.module'],
		actions: ['license.hasLicense'],
	}

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async call(method: string, data: any): Promise<any> {
		if (!this.allowed && !this.whitelist.actions.includes(method)) {
			return this.localBroker.call(method, data);
		}

		await this.broker.waitForServices(method.split('.')[0]);
		return this.broker.call(method, data);
	}

	createService(instance: ServiceClass): void {
		this.localBroker.createService(instance);

		const name = instance.getName();

		// Listen for module license
		instance.onEvent('license.module', async ({ module, valid }) => {
			if (module === 'scalability') {
				// Should we believe on the event only? Could it be a call from the CE version?
				this.allowed = valid && await License.hasLicense('scalability');
				// console.log('on license.module', { allowed: this.allowed });
			}
		});

		const service: ServiceSchema = {
			name,
			actions: {},
			// Prevent listen events when not allowed except by `license.module`
			events: Object.fromEntries(Object.entries(instance.getEvents()).map(([event, fn]) => {
				if (!this.whitelist.events.includes(event)) {
					const originalFn = fn;
					fn = (...args: any[]): any => {
						if (this.allowed) {
							return originalFn(...args);
						}
					};
				}
				return [event, (data: any[]): void => fn(...data)];
			})),
			started: async (): Promise<void> => {
				if (name === 'license') {
					return;
				}

				this.allowed = await License.hasLicense('scalability');
				// console.log('on started', { allowed: this.allowed });
			},
		};

		if (!service.events || !service.actions) {
			return;
		}

		const methods = instance.constructor?.name === 'Object' ? Object.getOwnPropertyNames(instance) : Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
		for (const method of methods) {
			if (method === 'constructor') {
				continue;
			}

			const i = instance as any;

			if (method.match(/^on[A-Z]/)) {
				service.events[events[method]] = i[method].bind(i);
				continue;
			}

			if (lifecycle[method]) {
				service[method] = i[method].bind(i);
				continue;
			}

			service.actions[method] = async (ctx: Context<[]>): Promise<any> => asyncLocalStorage.run({
				id: ctx.id,
				nodeID: ctx.nodeID,
				requestID: ctx.requestID,
				broker: this,
			}, (): any => {
				if (this.allowed || this.whitelist.actions.includes(`${ name }.${ method }`)) {
					return i[method](...ctx.params);
				}
			});
		}

		this.broker.createService(service);
	}

	async broadcast<T extends keyof EventSignatures>(event: T, ...args: Parameters<EventSignatures[T]>): Promise<void> {
		if (!this.allowed && !this.whitelist.events.includes(event)) {
			return this.localBroker.broadcast(event, ...args);
		}
		return this.broker.broadcast(event, args);
	}

	async nodeList(): Promise<IBrokerNode[]> {
		return this.broker.call('$node.list');
	}
}

const Base = Serializers.Base as unknown as new () => {};

class EJSONSerializer extends Base {
	serialize(obj: {}): Buffer {
		return Buffer.from(EJSON.stringify(obj));
	}

	deserialize(buf: Buffer): any {
		return EJSON.parse(buf.toString());
	}
}

const {
	TRANSPORTER = 'TCP',
	CACHE = 'Memory',
	// SERIALIZER = 'MsgPack',
	SERIALIZER = 'EJSON',
	MOLECULER_LOG_LEVEL = 'error',
	BALANCE_STRATEGY = 'RoundRobin',
	BALANCE_PREFER_LOCAL = 'false',
	RETRY_FACTOR = '2',
	RETRY_MAX_DELAY = '1000',
	RETRY_DELAY = '100',
	RETRY_RETRIES = '5',
	RETRY_ENABLED = 'false',
	REQUEST_TIMEOUT = '10',
	HEARTBEAT_INTERVAL = '10',
	HEARTBEAT_TIMEOUT = '30',
	BULKHEAD_ENABLED = 'false',
	BULKHEAD_CONCURRENCY = '10',
	BULKHEAD_MAX_QUEUE_SIZE = '10000',
	MS_METRICS = 'false',
	MS_METRICS_PORT = '9458',
	TRACING_ENABLED = 'false',
} = process.env;

const network = new ServiceBroker({
	transporter: TRANSPORTER,
	metrics: {
		enabled: MS_METRICS === 'true',
		reporter: [{
			type: 'Prometheus',
			options: {
				port: MS_METRICS_PORT,
			},
		}],
	},
	cacher: CACHE,
	serializer: SERIALIZER === 'EJSON' ? new EJSONSerializer() : SERIALIZER,
	logLevel: MOLECULER_LOG_LEVEL as any,
	// logLevel: {
	// 	// "TRACING": "trace",
	// 	// "TRANS*": "warn",
	// 	BROKER: 'debug',
	// 	TRANSIT: 'debug',
	// 	'**': 'info',
	// },
	logger: {
		type: 'Console',
		options: {
			formatter: 'short',
		},
	},
	registry: {
		strategy: BALANCE_STRATEGY,
		preferLocal: BALANCE_PREFER_LOCAL !== 'false',
	},

	requestTimeout: parseInt(REQUEST_TIMEOUT) * 1000,
	retryPolicy: {
		enabled: RETRY_ENABLED === 'true',
		retries: parseInt(RETRY_RETRIES),
		delay: parseInt(RETRY_DELAY),
		maxDelay: parseInt(RETRY_MAX_DELAY),
		factor: parseInt(RETRY_FACTOR),
		check: (err: any): boolean => err && !!err.retryable,
	},

	maxCallLevel: 100,
	heartbeatInterval: parseInt(HEARTBEAT_INTERVAL),
	heartbeatTimeout: parseInt(HEARTBEAT_TIMEOUT),

	// circuitBreaker: {
	// 	enabled: false,
	// 	threshold: 0.5,
	// 	windowTime: 60,
	// 	minRequestCount: 20,
	// 	halfOpenTime: 10 * 1000,
	// 	check: (err: any): boolean => err && err.code >= 500,
	// },

	bulkhead: {
		enabled: BULKHEAD_ENABLED === 'true',
		concurrency: parseInt(BULKHEAD_CONCURRENCY),
		maxQueueSize: parseInt(BULKHEAD_MAX_QUEUE_SIZE),
	},

	tracing: {
		enabled: TRACING_ENABLED === 'true',
		exporter: {
			type: 'Jaeger',
			options: {
				endpoint: null,
				host: 'jaeger',
				port: 6832,
				sampler: {
					// Sampler type. More info: https://www.jaegertracing.io/docs/1.14/sampling/#client-sampling-configuration
					type: 'Const',
					// Sampler specific options.
					options: {},
				},
				// Additional options for `Jaeger.Tracer`
				tracerOptions: {},
				// Default tags. They will be added into all span tags.
				defaultTags: null,
			},
		},
	},
});

api.setBroker(new NetworkBroker(network));

network.start();
