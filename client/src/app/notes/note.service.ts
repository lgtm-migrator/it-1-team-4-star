import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Note } from './note';
import { map } from 'rxjs/operators';

@Injectable()
export class NoteService {
  readonly noteUrl: string = environment.API_URL + 'notes';

  constructor(private httpClient: HttpClient) {
  }

  getNotes(filters?: { owner?: string }): Observable<Note[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set('owner', filters.owner);
      }
    }
    return this.httpClient.get<Note[]>(this.noteUrl, {
      params: httpParams,
    });
  }

  getNoteById(id: string): Observable<Note> {
    return this.httpClient.get<Note>(this.noteUrl + '/' + id);
  }

  filterNotes(notes: Note[], filters: { body?: string, addDate?: Date, expirationDate?: Date,
    reusable?: boolean, draft?: boolean, toDelete?: boolean }): Note[] {

    let filteredNotes = notes;

    // Filter by body
    if (filters.body) {
      filters.body = filters.body.toLowerCase();

      filteredNotes = filteredNotes.filter(note => {
        return note.body.toLowerCase().indexOf(filters.body) !== -1;
      });
    }


    return filteredNotes;
  }

  addNote(newNote: Note): Observable<string> {
    // Send post request to add a new note with the note data as the body.
    return this.httpClient.post<{id: string}>(this.noteUrl + '/new', newNote).pipe(map(res => res.id));
  }
}
