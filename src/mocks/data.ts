// src/mocks/data.ts
import { faker } from '@faker-js/faker';
import type { User, Group } from '../types';

const createRandomGroup = (): Group => ({
  id: faker.string.uuid(),
  name: faker.company.name() + ' Group',
  role: faker.helpers.arrayElement(['admin', 'manager', 'member']),
});

const createRandomUser = (): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  status: faker.helpers.arrayElement(['active', 'inactive']),
  createdAt: faker.date.past().toISOString(),
  groups: faker.helpers.arrayElements([createRandomGroup(), createRandomGroup(), createRandomGroup()], { min: 1, max: 3 }),
});

export const db: User[] = Array.from({ length: 100 }, createRandomUser);