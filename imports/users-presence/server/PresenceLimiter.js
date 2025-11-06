// src/lib/PresenceLimiter.js
// -------------------------------------------------------------
import { settings } from '../../../app/settings/server';
import { UserPresenceEvents } from 'meteor/konecty:user-presence';
import { setUserStatus } from './activeUsers';
/**
 * Минимальный набор настроек – достаточно, чтобы менять их в одном месте.
 */
 let CONFIG = {
    // сколько событий считаем за окно (минимум 1)
    LIMIT_PER_MIN: 3,          // порог сообщений за минуту
    // длительность окна (миллисекунды)
    WINDOW_MS: 60 * 1000,        // 1 минут
    // сколько минут блокировать, если лимит превышен
    BLOCK_MS: 1 * 60 * 1000,    // 1 минут
  };

let timeoutHandler = null;

settings.get('Troubleshoot_LIMIT_PER_MIN', (key, value) => {
	CONFIG.LIMIT_PER_MIN = value || 100;
});
settings.get('Troubleshoot_LIMIT_PER_MS', (key, value) => {
	CONFIG.WINDOW_MS = value || 60000;
});
settings.get('Troubleshoot_LIMIT_PER_BLOCK_MS', (key, value) => {
	CONFIG.BLOCK_MS = value || 300000;
});


/**
 * Внутренний "распределённый" счётчик.  
 * Храним только массив меток времени прошедших событий
 * (можно хранить в любом другом типе – очередь, Redis‑список и т.п.).
 */
let timestamps = [];

/**
 * Время, до которого мы не будем отправлять статус.
 * Если равно 0 – не заблокированы.
 */
let blockUntil = 0;

/**
 * Очистить старые метки, чтобы оставались только события в окне.
 */
function trimOld(now) {
    const threshold = now - CONFIG.WINDOW_MS;
    // Если список небольш, обычный filter быстрее, чем while
    timestamps = timestamps.filter(ts => ts >= threshold);
    
    if (timeoutHandler) clearTimeout(timeoutHandler);
    timeoutHandler = null;
    
}


settings.get('Troubleshoot_LIMIT_PER', (key, value) => {
    //Если отключили то сбрасываем
    if (!value) {
        const now = Date.now();
        trimOld(now);
    }
});
  
  /**
   * Главная функция – проверка лимита и блокировки.
   * Возвращает true – можно отправить сообщение,
   * false – пропускаем его (сейчас либо в блоке, либо лимит превышен).
   */
export function canBroadcast() {

    if (!settings.get('Troubleshoot_LIMIT_PER')) return true;

    const now = Date.now();
  
    // 1️⃣ Если ещё в блоке – сразу отбрасываем
    if (now < blockUntil) {
      return false;
    }
  
    // 2️⃣ Убираем старые события
    trimOld(now);
  
    // 3️⃣ Если лимит уже достигнут – ставим блок и отбрасываем
    if (timestamps.length >= CONFIG.LIMIT_PER_MIN) {
      blockUntil = now + CONFIG.BLOCK_MS;
      console.warn(
        `[PresenceLimiter] Лимит превышен: ${timestamps.length} событий/мин. Блокируем до ${new Date(blockUntil).toISOString()}.`
      );
      // Убираем все старые записи, чтобы после разблокировки считать с нуля
      timestamps = [];
      
        UserPresenceEvents.removeListener('setUserStatus', setUserStatus);
        console.debug(`!!!!!!!!!!!!!!!Слушатель setUserStatus удалён. на ${CONFIG.BLOCK_MS} ms`);
        timeoutHandler = setTimeout(() => {
            console.debug(`!!!!!!!!!!!!!!!!!!!!Слушатель setUserStatus Включен.`);
            UserPresenceEvents.on('setUserStatus', setUserStatus);
        }, CONFIG.BLOCK_MS);
    }
  
    // 4️⃣ Всё OK – добавляем текущее событие и возвращаем true
    timestamps.push(now);
    return true;
}