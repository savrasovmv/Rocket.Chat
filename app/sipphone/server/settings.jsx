import { settings } from '../../settings'

settings.addGroup('SIPPhone', function () {
    this.add('SIPPhone_Enable', false, {
      type: 'boolean',
      group: 'SIPPhone',
      public: true,
    })

    this.add('SIPPhone_domain', 'fs2.fineapple.xyz', {
      type: 'string',
      group: 'SIPPhone',
      public: true,
    })
    // this.add('SIPPhone_uri', 'sip:1011@fs2.fineapple.xyz', {
    //   type: 'string',
    //   group: 'SIPPhone',
    //   public: true,
    // })
    this.add('SIPPhone_ws_servers', 'fs2.fineapple.xyz', {
      type: 'string',
      group: 'SIPPhone',
      public: true,
    })
    this.add('SIPPhone_ws_port', '7443', {
      type: 'string',
      group: 'SIPPhone',
      public: true,
    })

    this.add('SIPPhone_prefix', '', {
      type: 'string',
      group: 'SIPPhone',
      public: true,
    })

    this.add(
      'SIPPhone_STUN_Servers',
      'stun:stun.l.google.com:19302, stun:23.21.150.121, team%40rocket.chat:demo@turn:numb.viagenie.ca:3478',
      {
        type: 'string',
        group: 'SIPPhone',
        public: true,
      }
    )


    this.add('SIPPhone_Server_Sync_Host', '', {
      type: 'string',
      i18nLabel: 'Сервер для получения учетных данных',
      enableQuery: {
        _id: 'SIPPhone_Enable',
        value: true,
      },
    });

    this.add('SIPPhone_Server_Sync_DB', '', {
      type: 'string',
      i18nLabel: 'Баз данных учетных данных',
      enableQuery: {
        _id: 'SIPPhone_Enable',
        value: true,
      },
    });

    this.add('SIPPhone_Server_Sync_username', '', {
      type: 'string',
      i18nLabel: 'Имя для подключения к API ',
      enableQuery: {
        _id: 'SIPPhone_Enable',
        value: true,
      },
    });
    this.add('SIPPhone_Server_Sync_password', '', {
      type: 'string',
      i18nLabel: 'Пароль для подключения к API ',
      enableQuery: {
        _id: 'SIPPhone_Enable',
        value: true,
      },
    });

    this.add('SIPPhone_Server_Sync_token', '', {
      type: 'string',
      i18nLabel: 'Token для подключения к API ',
      enableQuery: {
        _id: 'SIPPhone_Enable',
        value: true,
      },
    });

    this.add('SIPPhone_Sync_Now', 'SIPPhone_sync_now', { type: 'action', actionText: 'Синхронизовать с FreeSWITCH'})

    this.add('SIPPhone_Sync_Test_Connect', 'SIPPhone_sync_test_connect', { type: 'action', actionText: 'Проверка соединения с FreeSWITCH'})


})
