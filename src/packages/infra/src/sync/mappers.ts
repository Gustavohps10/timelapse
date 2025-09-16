import { TimeEntryDTO } from '@timelapse/application'

import { TimeEntryDoc, UpdateTimeEntryData } from './types'

export class TimeEntryMapper {
  /**
   * Converte TimeEntryDTO para TimeEntryDoc (formato do RxDB)
   */
  static dtoToDoc(dto: TimeEntryDTO): TimeEntryDoc {
    if (!dto.id) {
      throw new Error('TimeEntryDTO deve ter um ID válido')
    }

    return {
      id: dto.id.toString(),
      project: {
        id: dto.project?.id ?? 0,
        name: dto.project?.name ?? '',
      },
      issue: {
        id: dto.issue?.id ?? 0,
      },
      user: {
        id: dto.user?.id ?? 0,
        name: dto.user?.name ?? '',
      },
      activity: {
        id: dto.activity?.id ?? 0,
        name: dto.activity?.name ?? '',
      },
      hours: dto.hours ?? 0,
      comments: dto.comments,
      spentOn: dto.spentOn
        ? this.formatDate(dto.spentOn)
        : this.formatDate(new Date()),
      createdAt: dto.createdAt
        ? this.formatDateTime(dto.createdAt)
        : this.formatDateTime(new Date()),
      updatedAt: dto.updatedAt
        ? this.formatDateTime(dto.updatedAt)
        : this.formatDateTime(new Date()),
    }
  }

  /**
   * Converte TimeEntryDoc para TimeEntryDTO
   */
  static docToDto(doc: TimeEntryDoc): TimeEntryDTO {
    return {
      id: parseInt(doc.id),
      project: {
        id: doc.project.id,
        name: doc.project.name,
      },
      issue: {
        id: doc.issue.id,
      },
      user: {
        id: doc.user.id,
        name: doc.user.name,
      },
      activity: {
        id: doc.activity.id,
        name: doc.activity.name,
      },
      hours: doc.hours,
      comments: doc.comments,
      spentOn: new Date(doc.spentOn),
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }
  }

  /**
   * Converte UpdateTimeEntryData para objeto de atualização do RxDB
   */
  static updateDataToDoc(data: UpdateTimeEntryData): Partial<TimeEntryDoc> {
    const updateDoc: Partial<TimeEntryDoc> = {
      updatedAt: this.formatDateTime(new Date()),
    }

    if (data.project !== undefined) {
      updateDoc.project = data.project
    }
    if (data.issue !== undefined) {
      updateDoc.issue = data.issue
    }
    if (data.user !== undefined) {
      updateDoc.user = data.user
    }
    if (data.activity !== undefined) {
      updateDoc.activity = data.activity
    }
    if (data.hours !== undefined) {
      updateDoc.hours = data.hours
    }
    if (data.comments !== undefined) {
      updateDoc.comments = data.comments
    }
    if (data.spentOn !== undefined) {
      updateDoc.spentOn = this.formatDate(data.spentOn)
    }

    return updateDoc
  }

  /**
   * Formata Date para string no formato YYYY-MM-DD
   */
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  /**
   * Formata Date para string no formato ISO datetime
   */
  static formatDateTime(date: Date): string {
    return date.toISOString()
  }

  /**
   * Valida se um TimeEntryDoc está válido
   */
  static validateDoc(doc: TimeEntryDoc): boolean {
    return !!(
      doc.id &&
      doc.project?.id &&
      doc.project?.name &&
      doc.issue?.id &&
      doc.user?.id &&
      doc.user?.name &&
      doc.activity?.id &&
      doc.activity?.name &&
      typeof doc.hours === 'number' &&
      doc.hours >= 0 &&
      doc.spentOn &&
      doc.createdAt &&
      doc.updatedAt
    )
  }

  /**
   * Cria um TimeEntryDoc para soft delete
   */
  static createDeletedDoc(id: string): TimeEntryDoc {
    const now = new Date()
    return {
      id,
      project: { id: 0, name: '' },
      issue: { id: 0 },
      user: { id: 0, name: '' },
      activity: { id: 0, name: '' },
      hours: 0,
      spentOn: this.formatDate(now),
      createdAt: this.formatDateTime(now),
      updatedAt: this.formatDateTime(now),
      _deleted: true,
    }
  }
}
