/**
 * Notification System - User feedback and messages
 * Handles success, error, warning, and info notifications
 */

export class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000; // 5 seconds
    }
    
    /**
     * Initialize the notification system
     */
    initialize() {
        this.createContainer();
        console.log('📢 Notification system initialized');
    }
    
    /**
     * Create notification container
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 2rem;
            z-index: 3500;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }
    
    /**
     * Show a notification
     * @param {Object} options - Notification options
     * @param {string} options.type - success, error, warning, info
     * @param {string} options.title - Notification title
     * @param {string} options.message - Notification message
     * @param {number} options.duration - Display duration in ms (0 for persistent)
     * @param {Function} options.onClick - Click handler
     */
    show(options) {
        const notification = this.createNotification(options);
        this.notifications.push(notification);
        
        // Remove oldest if we have too many
        if (this.notifications.length > this.maxNotifications) {
            this.remove(this.notifications[0]);
        }
        
        // Auto-remove after duration
        if (options.duration !== 0) {
            const duration = options.duration || this.defaultDuration;
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
        
        return notification;
    }
    
    /**
     * Create notification element
     */
    createNotification(options) {
        const notification = document.createElement('div');
        notification.className = `notification ${options.type || 'info'}`;
        notification.style.cssText = `
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 1rem 1.5rem;
            min-width: 300px;
            max-width: 500px;
            box-shadow: var(--shadow-lg);
            margin-bottom: 1rem;
            animation: slideInRight 0.3s ease-out;
            pointer-events: auto;
            cursor: pointer;
            transition: var(--transition);
        `;
        
        // Add type-specific styling
        switch (options.type) {
            case 'success':
                notification.style.borderLeft = '4px solid var(--success-color)';
                break;
            case 'error':
                notification.style.borderLeft = '4px solid var(--error-color)';
                break;
            case 'warning':
                notification.style.borderLeft = '4px solid var(--warning-color)';
                break;
            default:
                notification.style.borderLeft = '4px solid var(--accent-color)';
        }
        
        // Create notification content
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        `;
        
        const title = document.createElement('div');
        title.textContent = options.title || '';
        title.style.cssText = `
            font-weight: 600;
            color: var(--text-primary);
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(notification);
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        const body = document.createElement('div');
        body.textContent = options.message || '';
        body.style.cssText = `
            color: var(--text-secondary);
            font-size: 0.875rem;
        `;
        
        notification.appendChild(header);
        if (options.message) {
            notification.appendChild(body);
        }
        
        // Add click handler
        if (options.onClick) {
            notification.addEventListener('click', options.onClick);
        }
        
        // Add hover effects
        notification.addEventListener('mouseenter', () => {
            notification.style.transform = 'translateX(-5px)';
            notification.style.boxShadow = 'var(--shadow-lg)';
        });
        
        notification.addEventListener('mouseleave', () => {
            notification.style.transform = 'translateX(0)';
            notification.style.boxShadow = 'var(--shadow-md)';
        });
        
        this.container.appendChild(notification);
        
        return notification;
    }
    
    /**
     * Remove a notification
     */
    remove(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    /**
     * Clear all notifications
     */
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }
    
    /**
     * Show success notification
     */
    success(title, message, duration) {
        return this.show({
            type: 'success',
            title,
            message,
            duration
        });
    }
    
    /**
     * Show error notification
     */
    error(title, message, duration = 0) {
        return this.show({
            type: 'error',
            title,
            message,
            duration
        });
    }
    
    /**
     * Show warning notification
     */
    warning(title, message, duration) {
        return this.show({
            type: 'warning',
            title,
            message,
            duration
        });
    }
    
    /**
     * Show info notification
     */
    info(title, message, duration) {
        return this.show({
            type: 'info',
            title,
            message,
            duration
        });
    }
}