import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Note } from './note';
import { NoteService } from './note.service';
import { ɵɵresolveBody } from '@angular/core';

let date: Date = new Date();
console.log("Date= " + date);

let date2: Date = new Date();
console.log("Date= " + date2 + 1);

describe('Note service: ', () => {
  // A small collection of test notes
  const testNotes: Note[] = [
    {
      _id: '4126554g28628d3hefr33de3d',
      owner:'588935f57546a2daea44de7c',
      body: 'ducks go quack',
      // addDate: date,
      // expirationDate: date2,
      draft: true,
      reusable: false,
      toDelete: true
    },
    {
      _id: '1233211w32122v3etfd88c8d',
      owner: '588935f55b432bb2ff322160',
      body: 'cookie wuz hear',
      // addDate: date,
      // expirationDate: date2,
      draft: false,
      reusable: true,
      toDelete: false
    },
    {
      _id: '4444444a55555s6dddd77f8g',
      owner: '588935f5556f992bf8f37c01',
      body: 'cookie wuz hear prabubly',
      // addDate: date,
      // expirationDate: date2,
      draft: false,
      reusable: true,
      toDelete: false
    }
  ];
  let noteService: NoteService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    noteService = new NoteService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getNotes() calls api/notes', () => {
    // Assert that the notes we get from this call to getNotes()
    // should be our set of test notes. Because we're subscribing
    // to the result of getNotes(), this won't actually get
    // checked until the mocked HTTP request 'returns' a response.
    // This happens when we call req.flush(testNotes) a few lines
    // down.
    noteService.getNotes().subscribe(
      notes => expect(notes).toBe(testNotes)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(noteService.noteUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testNotes);
  });

  it('getNotes() calls api/notes with filter parameter \'creator\'', () => {

    noteService.getNotes({ creator: '588935f57546a2daea44de7c' }).subscribe(
      notes => expect(notes).toBe(testNotes)
    );

    // Specify that (exactly) one request will be made to the specified URL with the role parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(noteService.noteUrl) && request.params.has('creator')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the role parameter was '588935f57546a2daea44de7c'
    expect(req.request.params.get('creator')).toEqual('588935f57546a2daea44de7c');

    req.flush(testNotes);
  });


  it('getNoteById() calls api/notes/id', () => {
    const targetNote: Note = testNotes[1];
    const targetId: string = targetNote._id;
    noteService.getNoteById(targetId).subscribe(
      note => expect(note).toBe(targetNote)
    );

    const expectedUrl: string = noteService.noteUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetNote);
  });

  it('filterNotes() filters by body', () => {
    expect(testNotes.length).toBe(3);
    const noteBody = 'cook';
    expect(noteService.filterNotes(testNotes, { body: noteBody }).length).toBe(2);
  });

  it('filterNotes() filters by addDate', () => {
    expect(testNotes.length).toBe(3);
    const noteAddDate = date;
    expect(noteService.filterNotes(testNotes, { addDate: noteAddDate }).length).toBe(3);
  });

  it('filterNotes() filters by expirationDate', () => {
    expect(testNotes.length).toBe(3);
    const noteExpirationDate = date2;
    expect(noteService.filterNotes(testNotes, { expirationDate: noteExpirationDate }).length).toBe(2);
  });

  it('filterNotes() filters by draft', () => {
    expect(testNotes.length).toBe(3);
    const noteDraft = false;
    expect(noteService.filterNotes(testNotes, { draft: noteDraft }).length).toBe(2);
  });

  it('filterNotes() filters by toDelete', () => {
    expect(testNotes.length).toBe(3);
    const noteToDelete = true;
    expect(noteService.filterNotes(testNotes, { toDelete: noteToDelete }).length).toBe(1);
  });

  it('filterNotes() filters by reusable', () => {
    expect(testNotes.length).toBe(3);
    const noteReusable = false;
    expect(noteService.filterNotes(testNotes, { reusable: noteReusable}).length).toBe(1);
  });

  it('filterNotes() filters by body and expiration date', () => {
    expect(testNotes.length).toBe(3);
    const noteBody = 'wuz';
    const noteExpirationDate = date2;
    expect(noteService.filterNotes(testNotes, { body: noteBody, expirationDate: noteExpirationDate }).length).toBe(1);
  }) ;

  it('addNote() calls api/notes/new', () => {

    noteService.addNote(testNotes[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(noteService.noteUrl + '/new');

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testNotes[1]);

    req.flush({id: 'testid'});
  });
});
