import { nanoid } from "nanoid";

const LOCALSTORAGE_USER_KEY = "user";

class UserService {
  private userId: string;

  constructor() {
    const storedUserId = window.localStorage.getItem(LOCALSTORAGE_USER_KEY);

    if (storedUserId) {
      this.userId = storedUserId;
    } else {
      this.userId = nanoid();
      window.localStorage.setItem(LOCALSTORAGE_USER_KEY, this.userId);
    }
  }

  getUserId() {
    return this.userId;
  }
}

export default new UserService();
