import { InputState } from "./types";

export class InputHandler {
  private state: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    switch (e.key.toLowerCase()) {
      case "w":
      case "arrowup":
        this.state.forward = true;
        break;
      case "s":
      case "arrowdown":
        this.state.backward = true;
        break;
      case "a":
      case "arrowleft":
        this.state.left = true;
        break;
      case "d":
      case "arrowright":
        this.state.right = true;
        break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    switch (e.key.toLowerCase()) {
      case "w":
      case "arrowup":
        this.state.forward = false;
        break;
      case "s":
      case "arrowdown":
        this.state.backward = false;
        break;
      case "a":
      case "arrowleft":
        this.state.left = false;
        break;
      case "d":
      case "arrowright":
        this.state.right = false;
        break;
    }
  };

  public getState(): InputState {
    return { ...this.state };
  }

  public dispose(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
