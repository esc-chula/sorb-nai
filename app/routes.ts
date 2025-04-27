import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'

export default [
  layout('./routes/layout.tsx', [
    index('./routes/home.tsx'),
    route('/:studentId', './routes/[studentId]/select-classes.tsx'),
    route('/:studentId/schedule', './routes/[studentId]/schedule.tsx'),
  ]),
] satisfies RouteConfig
