import { In, MoreThan, Repository } from 'typeorm';
import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Workshop } from './entities/workshop.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Workshop)
    private workshopRepository: Repository<Workshop>,
  ) {}

  getWarmupEvents() {
    return this.eventRepository.find();
  }

  /*
    Requirements:
    - maximum 2 sql queries
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    Hints:
    - open the `src/events/events.service` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /events/events:
    ```json
    [
      {
        id: 1,
        name: 'Laravel convention 2021',
        createdAt: '2021-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 1,
            start: '2021-02-21 10:00:00',
            end: '2021-02-21 16:00:00',
            eventId: 1,
            name: 'Illuminate your knowledge of the laravel code base',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 2,
        name: 'Laravel convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 2,
            start: '2023-10-21 10:00:00',
            end: '2023-10-21 18:00:00',
            eventId: 2,
            name: 'The new Eloquent - load more with less',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 3,
            start: '2023-11-21 09:00:00',
            end: '2023-11-21 17:00:00',
            eventId: 2,
            name: 'AutoEx - handles exceptions 100% automatic',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 3,
        name: 'React convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 4,
            start: '2023-08-21 10:00:00',
            end: '2023-08-21 18:00:00',
            eventId: 3,
            name: '#NoClass pure functional programming',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 5,
            start: '2023-08-21 09:00:00',
            end: '2023-08-21 17:00:00',
            eventId: 3,
            name: 'Navigating the function jungle',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
    ]
    ```
     */

  @Get('events')
  async getEventsWithWorkshops() {
    // throw new Error('TODO task 1');
    const workshopMap = await this.workshopRepository.find().then(res => res.reduce((map: {[field: number]: Workshop[]} , ws) => {
      map[ws.eventId] = map[ws.eventId] || [];
      map[ws.eventId].push(ws);
      return map;
    }, {}));
    return this.eventRepository.find().then(res => res.map(x => {
      Object.assign(x, {workshops: workshopMap[x.id]});
      return x;
    }));
  }

  /*
    Requirements:
    - only events that have not yet started should be included
    - the event starting time is determined by the first workshop of the event
    - the code should result in maximum 3 SQL queries, no matter the amount of events
    - all filtering of records should happen in the database
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    Hints:
    - open the `src/events/events.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    - join, whereIn, min, groupBy, havingRaw might be helpful
    - in the sample data set  the event with id 1 is already in the past and should therefore be excluded
    Sample response on GET /futureevents:
    ```json
    [
        {
            "id": 2,
            "name": "Laravel convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 2,
                    "start": "2023-10-21 10:00:00",
                    "end": "2023-10-21 18:00:00",
                    "eventId": 2,
                    "name": "The new Eloquent - load more with less",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 3,
                    "start": "2023-11-21 09:00:00",
                    "end": "2023-11-21 17:00:00",
                    "eventId": 2,
                    "name": "AutoEx - handles exceptions 100% automatic",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        },
        {
            "id": 3,
            "name": "React convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 4,
                    "start": "2023-08-21 10:00:00",
                    "end": "2023-08-21 18:00:00",
                    "eventId": 3,
                    "name": "#NoClass pure functional programming",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 5,
                    "start": "2023-08-21 09:00:00",
                    "end": "2023-08-21 17:00:00",
                    "eventId": 3,
                    "name": "Navigating the function jungle",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        }
    ]
    ```
     */
  @Get('futureevents')
  async getFutureEventWithWorkshops() {
    // throw new Error('TODO task 2');
    const today = new Date();
    const eventId = await this.workshopRepository.find({where: {
      start: MoreThan(today.toISOString()),
    }}).then(res => res.map(x => x.eventId));
    const workshopMap = await this.workshopRepository.find().then(res => res.reduce((map: {[field: number]: Workshop[]} , ws) => {
      map[ws.eventId] = map[ws.eventId] || [];
      map[ws.eventId].push(ws);
      return map;
    }, {}));
    return this.eventRepository.find({
      where: {
        id: In(eventId),
      },
    }).then(res => res.map(x => {
      Object.assign(x, {workshops: workshopMap[x.id]});
      return x;
    }))
  }
}
