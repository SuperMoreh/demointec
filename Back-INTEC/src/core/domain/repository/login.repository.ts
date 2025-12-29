export interface LoginRepository<T> {
    login(email: string, password: string): Promise<T>;
  }
  