import { User } from '../index';

const BASE_URL = import.meta.env.VITE_BASE_URL;
//const ROUTE = 'user';

//async function apiClient(id?: string): Promise<Users[]> {
//  const url = id ? `${BASE_URL}/${ROUTE}/${id}` : `${BASE_URL}/${ROUTE}`;
//  const response = await fetch(url);
//  if (response.ok) {
//    return response.json() as Promise<Users[]>;
//  }
//  return Promise.reject(new Error('Something went wrong'));
//}

//export function getAllUsers(): Promise<Users[]> {
//	return apiClient()}

//export function getUserByClerkId(id: string): Promise<User> {
//  return apiClient(id)
//}

export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/user`);
  if (response.ok) {
    const data = await response.json();
    return data as Promise<User[]>;
  }
  return Promise.reject(new Error('Something went 🦖RA-WRong'));
}

export async function getUserByClerkId(id: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (response.ok) {
    const data = await response.json();
    return data as Promise<User>;
  }
  return Promise.reject(new Error('Something went 🦖RA-WRong'));
}

export async function addUser(user: User): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clerkId: user.clerkId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    return data as Promise<User>;
  }
  return Promise.reject(new Error('Something went 🦖RA-WRong'));
}
