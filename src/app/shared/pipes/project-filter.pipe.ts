import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectFilter'
})
export class ProjectFilterPipe implements PipeTransform {
  transform(projects: any[], status: string): any[] {
    if (!projects) return [];
    if (!status) return projects;
    return projects.filter(project => project.status === status);
  }
}
