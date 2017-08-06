import capitalize from './capitalize';

const sectors = [
  'industrial',
  'commercial',
  'residential',
];

export const sectorRouteMap = sectors.map(sector => {
  return {
    name: capitalize(sector), 
    route: `city.${sector}`
  };
});

export default sectors;
