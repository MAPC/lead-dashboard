import Controller from '@ember/controller';

import { sectorRouteMap } from '../utils/sectors';


export default class extends Controller {
  sectors = sectorRouteMap;
}
