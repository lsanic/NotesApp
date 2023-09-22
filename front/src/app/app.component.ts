import { Component, OnInit } from '@angular/core';
import { NoteService } from './services/noteService';
import { Note } from './models/noteModel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'NotesFront';
  notes: Note[] = [];
  pinnedNotes: Note[] = [];
  editingNote: Note | null = null;
  newNote: Note = { title: '', content: '', createdAt: new Date().toISOString() };
  isCreatingNote = false;
  searchQuery: string = '';
  ///filteredNotes: Note[];

  constructor(
    private noteService: NoteService,
    ) {
      //this.filteredNotes = [];
    }

  ngOnInit() {
    this.loadNotes();
  }
  ///initial load za notes, kada se upali app
 loadNotes() {
    // Load the regular notes
    this.noteService.getNotes().subscribe(
      (notes: Note[]) => {
        // Filter out pinned notes from regular notes
        this.notes = notes.filter(note => !this.pinnedNotes.includes(note));
      },
      error => {
        console.error('Error loading notes:', error);
      }
    );
  
  }
  /// reload se koristi samo kod novog kreiranja notea kako se pinani notes ne bi svrstali u obicne
  /// ili replicirali ako pinane notes stavimo na this.pinnednotes
 reloadnotes()
 {
  this.noteService.getNotes().subscribe(
    (notes: Note[]) => {
      this.notes =  this.notes = notes.filter(note => !this.pinnedNotes.some(pinnedNote => pinnedNote.id === note.id));
      this.pinnedNotes= this.pinnedNotes; 
    },
    error => {
      console.error('Error loading notes:', error);
    }
  );
  
 }
 /*
  onSearch() {
    if (this.searchQuery) {
     
      const searchTerm = this.searchQuery.toLowerCase();
  
      
      this.filteredNotes = this.notes.filter(note => {
        const title = note.title.toLowerCase();
        const content = note.content ? note.content.toLowerCase() : '';  
  
       
        return title.includes(searchTerm) || content.includes(searchTerm);
      });
    } else {
      
      this.filteredNotes = this.notes;
    }
  }
  */
  

  addNote() {
    this.isCreatingNote = true;
    this.newNote = { title: '', content: '', createdAt: new Date().toISOString() };
  }

  cancelNote() {
    this.isCreatingNote = false;
  }
  

  onPin(note: Note) {
    console.log('Toggling pin for note:', note);
  
    if (this.pinnedNotes.includes(note)) {
      console.log('Unpinning note:', note);
  
      // Remove the note from the pinnedNotes array
      this.pinnedNotes = this.pinnedNotes.filter(n => n !== note);
  
      // Add the note to the regular notes array
      this.notes = [...this.notes, note];
    } else {
      console.log('Pinning note:', note);
  
      // Remove the note from the regular notes array
      this.notes = this.notes.filter(n => n !== note);
  
      // Add the note to the pinnedNotes array
      this.pinnedNotes = [...this.pinnedNotes, note];
    }
  
    console.log('Pinned notes:', this.pinnedNotes);
    console.log('Notes:', this.notes);
  }
  
  
  
  onEdit(note: Note) {
    console.log('Editing note:', note);
    this.editingNote = { ...note }; 
  }
  
  saveNote() {
    this.noteService.createNote(this.newNote).subscribe(
      (createdNote: Note) => {
        
          this.notes.push(createdNote); 
          this.reloadnotes();
        
  
        this.newNote = { title: '', content: '', createdAt: new Date().toISOString() };
        this.isCreatingNote = false;
        
      },
      error => {
        console.error('Error adding note:', error);
      }
      
    );
  }

  saveEditNote() {
    if (this.editingNote) {
      console.log('Saving note:', this.editingNote);
  
      // Check if the edited note is in the pinnedNotes array
      const indexInPinnedNotes = this.pinnedNotes.findIndex(pinnedNote => pinnedNote.id === this.editingNote!.id);
  
      // Check if the edited note is in the notes array
      const indexInNotes = this.notes.findIndex(note => note.id === this.editingNote!.id);
  
      if (indexInPinnedNotes !== undefined && indexInPinnedNotes !== -1) {
        // Update the pinned note directly in the pinnedNotes array
        this.pinnedNotes[indexInPinnedNotes].title = this.editingNote.title;
        this.pinnedNotes[indexInPinnedNotes].content = this.editingNote.content;
      }
  
      if (indexInNotes !== undefined && indexInNotes !== -1) {
        // Update the note in the notes array
        this.notes[indexInNotes].title = this.editingNote.title;
        this.notes[indexInNotes].content = this.editingNote.content;
      }
  
      // Now, update the note on the server using your service
      this.noteService.updateNote(this.editingNote).subscribe(updatedNote => {
        console.log('Note updated on server:', updatedNote);
        // You can handle success here if needed.
      }, error => {
        console.error('Error updating note on server:', error);
        // Handle error appropriately.
      });
  
      this.editingNote = null;
    }
  }
  

  onDelete(note: Note) {
    const confirmed = confirm('Are you sure you want to delete this note?');
  
    if (confirmed) {
      console.log('Deleting note...');
  
      if (note.id !== undefined) {
        this.noteService.deleteNote(note.id).subscribe(
          () => {
            console.log('Note deleted successfully.');
            this.notes = this.notes.filter(n => n !== note);
            this.pinnedNotes = this.pinnedNotes.filter(n => n !== note);
          },
          error => {
            console.error('Error deleting note:', error);
          }
        );
      } else {
        console.error('Cannot delete note. Invalid note ID.');
      }
    } else {
      console.log('Deletion cancelled.');
    }
  }
  
}