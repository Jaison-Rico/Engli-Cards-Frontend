import client from './client';

export const loginUser = (email, password) =>
  client.post('/auth/login', { email, password }).then((r) => r.data);

export const registerUser = (name, email, password) =>
  client.post('/auth/register', { name, email, password }).then((r) => r.data);

export const requestPasswordReset = (email) =>
  client.post('/auth/forgot-password', { email }).then((r) => r.data);

export const verifyResetCode = (email, otp) =>
  client.post('/auth/verify-otp', { email, otp }).then((r) => r.data);

export const resetPassword = (resetToken, newPassword) =>
  client.post('/auth/reset-password', { resetToken, newPassword }).then((r) => r.data);
