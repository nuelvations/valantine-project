import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs
export const createOrGetUser = (email: string, name: string) =>
  apiClient.post('/users/create-or-get', { email, name });

export const getUserStats = (userId: string) =>
  apiClient.get(`/users/${userId}/stats`);

export const loginUser = (email: string, username: string) =>
  apiClient.post(`/users/register`, { email, username });

export const checkUser = (email: string) =>
  apiClient.get(`/users/check-user?email=${email}`);

// Question APIs
export const createQuestion = (data: {
  userId: string;
  mood: string;
  choice: string;
  context: string;
}) => apiClient.post('/questions/generate', data);

export const getQuestion = (questionId: string) =>
  apiClient.get(`/questions/${questionId}`);

export const getQuestionsByUser = (userId: string) =>
  apiClient.get(`/questions/user/${userId}`);

// Answer APIs
export const submitAnswers = (data: {
  questionId: string;
  userId: string;
  answers: Array<{ question: string; answer: string }>;
}) => apiClient.post('/answers/submit', data);

export const getUserAnswers = (questionId: string, userId: string) =>
  apiClient.get(`/answers/${questionId}/${userId}`);

export const hasPartnerAnswered = (questionId: string) =>
  apiClient.get(`/answers/has-partner-answered/${questionId}`);

// Score APIs
export const compareAnswers = (questionId: string) =>
  apiClient.post(`/scores/compare/${questionId}`);

export const getScore = (questionId: string) =>
  apiClient.get(`/scores/${questionId}`);

export const claimPoints = (scoreId: string) =>
  apiClient.post(`/scores/claim/${scoreId}`);
