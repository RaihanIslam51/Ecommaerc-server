// config/constants.js

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_STATUS_UPDATED: 'order_status_updated',
  NEW_MESSAGE: 'new_message',
  LOW_STOCK: 'low_stock',
  SYSTEM: 'system'
};

export const MESSAGE_TYPES = {
  CUSTOMER_MESSAGE: 'customer_message',
  SUPPORT_REPLY: 'support_reply',
  SYSTEM: 'system'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  MAX_NAME_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 5000
};

export default {
  HTTP_STATUS,
  USER_ROLES,
  ORDER_STATUS,
  NOTIFICATION_TYPES,
  MESSAGE_TYPES,
  PAGINATION,
  VALIDATION
};
