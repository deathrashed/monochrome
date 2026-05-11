// js/ios-modal.js
// Replaces native alert/confirm/prompt with iOS-style bottom sheet dialogs.
// Falls back to the native APIs on non-iOS platforms.

import { isIos } from './platform-detection.js';

/**
 * Show an iOS-style alert sheet. Resolves when dismissed.
 * Falls back to window.alert on desktop.
 * @param {string} message
 * @param {string} [title]
 */
export function showAlert(message, title = '') {
    if (!isIos) {
        alert(title ? `${title}\n${message}` : message);
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        const overlay = _buildOverlay();
        overlay.innerHTML = `
            <div class="ios-toast-sheet" role="alertdialog" aria-modal="true">
                <div class="ios-toast-body">
                    ${title ? `<div class="ios-toast-title">${_esc(title)}</div>` : ''}
                    <div class="ios-toast-message">${_esc(message)}</div>
                </div>
                <div class="ios-toast-actions">
                    <button class="primary">OK</button>
                </div>
            </div>`;
        overlay.querySelector('button').addEventListener('click', () => {
            _dismiss(overlay);
            resolve();
        });
        document.body.appendChild(overlay);
    });
}

/**
 * Show an iOS-style confirmation sheet. Resolves to true/false.
 * Falls back to window.confirm on desktop.
 * @param {string} message
 * @param {string} [title]
 * @param {string} [confirmLabel]
 * @param {boolean} [destructive] - style confirm button as red destructive action
 */
export function showConfirm(message, title = '', confirmLabel = 'OK', destructive = false) {
    if (!isIos) {
        return Promise.resolve(confirm(title ? `${title}\n${message}` : message));
    }
    return new Promise((resolve) => {
        const overlay = _buildOverlay();
        overlay.innerHTML = `
            <div class="ios-toast-sheet" role="alertdialog" aria-modal="true">
                <div class="ios-toast-body">
                    ${title ? `<div class="ios-toast-title">${_esc(title)}</div>` : ''}
                    <div class="ios-toast-message">${_esc(message)}</div>
                </div>
                <div class="ios-toast-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="confirm-btn ${destructive ? 'destructive' : 'primary'}">${_esc(confirmLabel)}</button>
                </div>
            </div>`;
        overlay.querySelector('.cancel-btn').addEventListener('click', () => {
            _dismiss(overlay);
            resolve(false);
        });
        overlay.querySelector('.confirm-btn').addEventListener('click', () => {
            _dismiss(overlay);
            resolve(true);
        });
        document.body.appendChild(overlay);
    });
}

/**
 * Show an iOS-style text input sheet. Resolves to string or null if cancelled.
 * Falls back to window.prompt on desktop.
 * @param {string} message
 * @param {string} [defaultValue]
 * @param {string} [title]
 */
export function showPrompt(message, defaultValue = '', title = '') {
    if (!isIos) {
        return Promise.resolve(prompt(title ? `${title}\n${message}` : message, defaultValue));
    }
    return new Promise((resolve) => {
        const overlay = _buildOverlay();
        overlay.innerHTML = `
            <div class="ios-toast-sheet" role="alertdialog" aria-modal="true">
                <div class="ios-toast-body">
                    ${title ? `<div class="ios-toast-title">${_esc(title)}</div>` : ''}
                    <div class="ios-toast-message">${_esc(message)}</div>
                </div>
                <input class="ios-toast-input" type="text" value="${_esc(defaultValue)}" />
                <div class="ios-toast-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="confirm-btn primary">OK</button>
                </div>
            </div>`;
        const input = overlay.querySelector('.ios-toast-input');
        setTimeout(() => input.focus(), 150);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { _dismiss(overlay); resolve(input.value); }
            if (e.key === 'Escape') { _dismiss(overlay); resolve(null); }
        });
        overlay.querySelector('.cancel-btn').addEventListener('click', () => {
            _dismiss(overlay);
            resolve(null);
        });
        overlay.querySelector('.confirm-btn').addEventListener('click', () => {
            _dismiss(overlay);
            resolve(input.value);
        });
        document.body.appendChild(overlay);
    });
}

function _buildOverlay() {
    const el = document.createElement('div');
    el.className = 'ios-toast-overlay';
    return el;
}

function _dismiss(overlay) {
    overlay.style.animation = 'ios-overlay-in 0.15s ease reverse forwards';
    const sheet = overlay.querySelector('.ios-toast-sheet');
    if (sheet) sheet.style.animation = 'ios-sheet-in 0.15s ease reverse forwards';
    setTimeout(() => overlay.remove(), 160);
}

function _esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
