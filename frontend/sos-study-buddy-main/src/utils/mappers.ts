export const mapSubjectPayload = (form: any) => ({
  subjectName: form.name,
  subjectPriority: Number(form.priority) || 1,
  subjectTag: form.tag,
});

export const mapDeadlinePayload = (form: any) => ({
  deadlineTitle: form.title,
  deadlineDate: new Date(form.date).toISOString(),
  deadlineType: form.type,
  deadlinePriority: Number(form.priority) || 1,
});