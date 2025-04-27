import type {
  ClassInfoWithInRange,
  ClassSchedule,
  MyClassInfoWithInRange,
} from '~/types/class'

function isEmptyData(data: ClassSchedule): boolean {
  return Object.keys(data).length === 0
}

function isStudentInRange(studentId: string, range: string): boolean {
  const studentIdNum = parseInt(studentId, 10)
  if (isNaN(studentIdNum)) return false

  return range
    .split(',')
    .map((part) => part.trim())
    .some((range) => {
      if (range.includes('-')) {
        const [start, end] = range
          .split('-')
          .map((s) => s.trim())
          .map((s) => parseInt(s, 10))

        return (
          !isNaN(start) &&
          !isNaN(end) &&
          studentIdNum >= start &&
          studentIdNum <= end
        )
      }

      const singleId = parseInt(range, 10)
      return !isNaN(singleId) && studentIdNum === singleId
    })
}

function mapClassesFromData(data: ClassSchedule) {
  return Object.values(data).map((value) => ({ ...value }))
}

export function getClassInfoWithInRange(
  studentId: string,
  data: ClassSchedule
): ClassInfoWithInRange[] {
  if (isEmptyData(data)) {
    return []
  }

  const classes = mapClassesFromData(data)
  const classesWithInRange: ClassInfoWithInRange[] = classes.map(
    (classInfo) => ({
      ...classInfo,
      inRange: classInfo.group.some(
        (g) =>
          g.range &&
          typeof g.range === 'string' &&
          isStudentInRange(studentId, g.range)
      ),
    })
  )

  return classesWithInRange
}

export function getMyClassInfoWithInRange(
  studentId: string,
  data: ClassSchedule
): MyClassInfoWithInRange[] {
  if (isEmptyData(data)) {
    return []
  }

  const classes = mapClassesFromData(data)
  const myClassesWithInRange = classes
    .map((classInfo) => {
      const matchedGroup = classInfo.group.find(
        (group) =>
          group.range &&
          typeof group.range === 'string' &&
          isStudentInRange(studentId, group.range)
      )

      if (!matchedGroup) {
        return null
      }

      return {
        ...classInfo,
        inRange: true,
        group: matchedGroup,
      }
    })
    .filter(
      (classInfo): classInfo is MyClassInfoWithInRange => classInfo !== null
    )

  return myClassesWithInRange
}
