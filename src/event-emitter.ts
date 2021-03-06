/*
 * Copyright 2019-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, softwareq
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type TypedEventListener<T> = (event: T) => void;

export interface TypedEventEmitter<T> {
  addEventListener(listener: TypedEventListener<T>): void;
  removeEventListener(listener: TypedEventListener<T>): void;
}

/**
 * @internal
 */
export class InternalEventEmitter<T> implements TypedEventEmitter<T> {
  private listener: Array<TypedEventListener<T>> = [];

  public addEventListener(listener: TypedEventListener<T>) {
    this.listener.push(listener);
  }

  public removeEventListener(listener: TypedEventListener<T>) {
    this.listener = this.listener.filter((li) => li !== listener);
  }

  public dispatchEvent(event: T) {
    this.listener.forEach((listener) => {
      listener(event);
    });
  }
}
