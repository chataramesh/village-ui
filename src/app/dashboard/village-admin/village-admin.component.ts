import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-village-admin',
  templateUrl: './village-admin.component.html',
  styleUrls: ['./village-admin.component.scss']
})
export class VillageAdminComponent implements OnInit {
  ngOnInit(): void {
  }
  searchText = '';
  filterStatus = '';

  projects = [
    {
      status: 'finished',
      title: 'Finished Project',
      name: 'Graphic Design',
      time: 'Active recently',
      categoryColor: 'category_color1',
      tasks: ['Coming soon banner', 'Book cover'],
      contributors: ['assets/img/1.jpg', 'assets/img/2.jpg', 'assets/img/3.jpg']
    },
    {
      status: 'ongoing',
      title: 'Ongoing Project',
      name: 'Magazine',
      time: '1 hour ago',
      categoryColor: '',
      tasks: ['Editorial page content'],
      contributors: ['assets/img/4.jpg', 'assets/img/5.jpg']
    },
    {
      status: 'stalled',
      title: 'Stalled Project',
      name: 'Layouting',
      time: '1 day ago',
      categoryColor: 'category_color3',
      tasks: ['Fix layout on page ads'],
      contributors: ['assets/img/6.jpg']
    },
    {
      status: 'recent',
      title: 'Recent Project',
      name: 'Branding',
      time: '3 day ago',
      categoryColor: 'category_color4',
      tasks: ['Brainstorming shapes'],
      contributors: ['assets/img/7.jpg']
    },
    {
      status: 'ongoing',
      title: 'Ongoing Project',
      name: 'Guidelines',
      time: '5 day ago',
      categoryColor: '',
      tasks: ['Make brand guidelines for marked cosmetics'],
      contributors: ['assets/img/8.jpg', 'assets/img/2.jpg']
    },
    {
      status: 'stalled',
      title: 'Stalled Project',
      name: 'Photoshoot',
      time: '1 week ago',
      categoryColor: 'category_color3',
      tasks: ['Get the photo ready for magazine'],
      contributors: ['assets/img/5.jpg', 'assets/img/6.jpg', 'assets/img/1.jpg']
    }
  ];

  recentProjects = [
    { name: 'Layouting', owner: 'Chidozie Kachukwu', categoryColor: 'category_color1' },
    { name: 'Photoshoot', owner: 'Musa Ismail', categoryColor: 'category_color2' },
    { name: 'Branding', owner: 'Ezekiel Arowolo', categoryColor: 'category_color3' },
    { name: 'Graphics Design', owner: 'Matthew Kelechi', categoryColor: 'category_color4' }
  ];
}
