import { http, HttpResponse } from 'msw';
import { items as itemsData, stock as stockData } from '../data/items';

export const itemsHandlers = [
  // Get all items
  http.get('/api/items', () => {
    return HttpResponse.json({ data: itemsData });
  }),

  // Get item by id
  http.get('/api/items/:id', ({ params }) => {
    const item = itemsData.find(i => i.id === params.id);
    if (!item) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return HttpResponse.json(item);
  }),

  // Get all stock
  http.get('/api/stock', () => {
    return HttpResponse.json({ data: stockData });
  }),

  // Get stock by location
  http.get('/api/stock/location/:location', ({ params }) => {
    const locationStock = stockData.filter(s => s.location === params.location);
    return HttpResponse.json({ data: locationStock });
  }),
];
