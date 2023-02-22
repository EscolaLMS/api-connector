import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from 'react';
import {
  EscolaLMSContextConfig,
  EscolaLMSContextReadConfig,
  ContextPaginatedMetaState,
} from './types';
import { defaultConfig } from './defaults';
import { fetchDataType } from './states';

import { useLocalStorage } from '../hooks/useLocalStorage';
import * as API from './../../types/api';
import { getDefaultData } from './index';

import { tasks as getTasks } from './../../services/tasks';
import { UserContext } from './user';

export const TasksContext: React.Context<
  Pick<EscolaLMSContextConfig, 'tasks' | 'fetchTasks'>
> = createContext({
  tasks: defaultConfig.tasks,
  fetchTasks: defaultConfig.fetchTasks,
});

export interface TasksContextProviderType {
  apiUrl: string;
  defaults?: Partial<Pick<EscolaLMSContextReadConfig, 'tasks'>>;
}

export const TasksContextProvider: FunctionComponent<
  PropsWithChildren<TasksContextProviderType>
> = ({ children, defaults, apiUrl }) => {
  const abortControllers = useRef<Record<string, AbortController | null>>({});

  const { token } = useContext(UserContext);
  console.log('token', token);

  useEffect(() => {
    if (defaults) {
      defaults.tasks !== null &&
        setTasks({
          loading: false,
          list: defaults.tasks?.list,
          error: undefined,
        });
    }
  }, [defaults]);

  const [tasks, setTasks] = useLocalStorage<
    ContextPaginatedMetaState<API.Task>
  >(
    'lms',
    'tasks',
    getDefaultData('tasks', {
      ...defaultConfig,
      ...defaults,
    })
  );

  const fetchTasks = useCallback(
    (filter: API.TaskParams) => {
      return token
        ? fetchDataType<API.Task>({
            controllers: abortControllers.current,
            controller: `tasks/${JSON.stringify(filter)}`,
            mode: 'paginated',
            fetchAction: getTasks.bind(null, apiUrl)(token, filter, {
              signal:
                abortControllers.current[`tasks/${JSON.stringify(filter)}`]
                  ?.signal,
            }),
            setState: setTasks,
          })
        : Promise.reject('noToken');
    },
    [token]
  );

  return (
    <TasksContext.Provider
      value={{
        tasks,
        fetchTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};
