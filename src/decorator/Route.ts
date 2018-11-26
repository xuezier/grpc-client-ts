import { ClientContainer } from '../ClientContainer';
import { Property } from '../interface/Property';

export function Route(target: any, key: string, property: Property) {
  ClientContainer.registryRoute(target, property, key);
}
