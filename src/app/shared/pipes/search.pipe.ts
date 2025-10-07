import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(searchText) ||
      (item.tasks && item.tasks.some((task: string) => task.toLowerCase().includes(searchText)))
    );
  }
}
