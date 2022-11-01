import { Injectable } from '@angular/core';
import { Organizer } from './organizer';
import { firebaseConfig } from './../../../environments/firebase.config';
import firebase from 'firebase/app';
import 'firebase/storage';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable()
export class OrganizerService {
  private basePath: string = firebaseConfig.devfestYear + '/organizers';
  private organizers: AngularFireList<Organizer> = null;
  private speaker: AngularFireObject<Organizer> = null;
  private firebaseStorage: any;

  constructor(private db: AngularFireDatabase) {
    this.firebaseStorage = firebase.storage();
  }

  getOrganizerList(): Observable<Organizer[]> {
    this.organizers = this.db.list(this.basePath, ref => ref.orderByChild('name'));
    return this.organizers.valueChanges();
  }

  getOrganizer(key: string): Observable<Organizer> {
    const path = `${this.basePath}/${key}`;
    this.speaker = this.db.object(path);
    return this.speaker.valueChanges();
  }

  createOrganizer(speaker: Organizer, file?: File): void {
    const key = this.db.list(this.basePath).push(speaker).key;
    if (file !== undefined && file !== null) {
      this.firebaseStorage.ref(this.basePath + `/${key}`).put(file)
        .then(snapshot => {
          speaker.photoURL = snapshot.downloadURL;
          this.db.object(this.basePath + `/${key}`).set(speaker);
        });
    } else {
      this.db.object(this.basePath + `/${key}`).set(speaker);
    }
  }

  updateOrganizer(speaker: Organizer, file?: File): void {
    if (file !== undefined && file !== null) {
      this.firebaseStorage.ref(this.basePath + `/${speaker.$key}`).put(file)
        .then(snapshot => {
          speaker.photoURL = snapshot.downloadURL;
          this.db.object(this.basePath + `/${speaker.$key}`).update(speaker);
        });
    } else {
      this.db.object(this.basePath + `/${speaker.$key}`).update(speaker);
    }
  }

  deleteOrganizer(key: string): void {
    this.organizers.remove(key)
      .then(onResolve => {
        this.firebaseStorage.ref(this.basePath + `/${key}`).delete();
      })
      .catch(error => this.handleError(error));
  }

  private handleError(error) {
    console.error(error);
  }

}
