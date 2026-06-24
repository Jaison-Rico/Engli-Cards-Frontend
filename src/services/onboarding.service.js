import client from './client';

export const getCategories = () =>
  client.get('/onboarding/categories').then((r) => r.data);

export const completeOnboarding = (categoryKeys) =>
  client.post('/onboarding/complete', { categoryKeys }).then((r) => r.data);
