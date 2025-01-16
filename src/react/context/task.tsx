import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from "react";
import {
  EscolaLMSContextConfig,
  EscolaLMSContextReadConfig,
  ContextListState,
  ContextStateValue,
} from "./types";
import { defaultConfig } from "./defaults";
import { fetchDataType, handleNoTokenError } from "./states";

import { useLocalStorage } from "../hooks/useLocalStorage";
import * as API from "../../types";
import { getDefaultData } from "./index";
import {
  getTask,
  updateTask as postUpdateTask,
  completeTask,
  incompleteTask,
} from "./../../services/tasks";
import {
  createTaskNote as postCreateTaskNote,
  updateTaskNote as patchUpdateTaskNote,
  deleteTaskNote as deleteDeleteTaskNote,
} from "../../services/task_notes";
import { UserContext } from "./user";

export const TaskContext: React.Context<
  Pick<
    EscolaLMSContextConfig,
    | "task"
    | "fetchTask"
    | "updateTask"
    | "updateTaskStatus"
    | "createTaskNote"
    | "updateTaskNote"
    | "deleteTaskNote"
  >
> = createContext({
  task: defaultConfig.task,
  fetchTask: defaultConfig.fetchTask,
  updateTask: defaultConfig.updateTask,
  updateTaskStatus: defaultConfig.updateTaskStatus,
  createTaskNote: defaultConfig.createTaskNote,
  updateTaskNote: defaultConfig.updateTaskNote,
  deleteTaskNote: defaultConfig.deleteTaskNote,
});

export interface TaskContextProviderType {
  apiUrl: string;
  defaults?: Partial<Pick<EscolaLMSContextReadConfig, "task">>;
  ssrHydration?: boolean;
}

export const TaskContextProvider: FunctionComponent<
  PropsWithChildren<TaskContextProviderType>
> = ({ children, defaults, apiUrl, ssrHydration }) => {
  const { token } = useContext(UserContext);

  const abortControllers = useRef<Record<string, AbortController | null>>({});

  const [task, setTask] = useLocalStorage<ContextStateValue<API.Task>>(
    "lms",
    "task",
    getDefaultData("task", {
      ...defaultConfig,
      ...defaults,
    }),
    ssrHydration
  );

  const fetchTask = useCallback(
    (id: number) => {
      return handleNoTokenError(
        token
          ? fetchDataType<API.Task>({
              controllers: abortControllers.current,
              controller: `task${id}`,
              id: id,
              mode: "value",
              fetchAction: getTask.bind(null, apiUrl)(token, id, {
                signal: abortControllers.current?.[`task${id}`]?.signal,
              }),
              setState: setTask,
            })
          : Promise.reject("noToken")
      );
    },
    [token]
  );

  const updateTask = useCallback(
    // TODO: update task on list and byID once it fine
    // TODO: what about error ?
    (id: number, data: EscolaLms.Tasks.Http.Requests.UpdateTaskRequest) => {
      return handleNoTokenError(
        token
          ? postUpdateTask(apiUrl, token, id, data)
          : Promise.reject("noToken")
      );
    },
    [token]
  );

  const updateTaskStatus = useCallback(
    // TODO: update task on list and byID once it fine
    // TODO: what about error ?
    (id: number, done: boolean = true) => {
      return handleNoTokenError(
        token
          ? done
            ? completeTask(apiUrl, token, id)
            : incompleteTask(apiUrl, token, id)
          : Promise.reject("noToken")
      );
    },
    [token]
  );

  const createTaskNote = useCallback(
    // TODO: update task on list and byID once it fine
    // TODO: what about error ?
    (id: number, note: string) => {
      return handleNoTokenError(
        token
          ? postCreateTaskNote(apiUrl, token, {
              task_id: id,
              note,
            })
          : Promise.reject("noToken")
      );
    },
    [token]
  );

  const updateTaskNote = useCallback(
    // TODO: update task on list and byID once it fine
    // TODO: what about error ?
    (taskId: number, taskNoteId: number, note: string) => {
      return handleNoTokenError(
        token
          ? patchUpdateTaskNote(apiUrl, token, taskNoteId, {
              task_id: taskId,
              note,
            })
          : Promise.reject("noToken")
      );
    },
    [token]
  );

  const deleteTaskNote = useCallback(
    // TODO: update task on list and byID once it fine
    // TODO: what about error ?
    (taskNoteId: number) => {
      return handleNoTokenError(
        token
          ? deleteDeleteTaskNote(apiUrl, token, taskNoteId)
          : Promise.reject("noToken")
      );
    },
    [token]
  );

  return (
    <TaskContext.Provider
      value={{
        task,
        fetchTask,
        updateTask,
        updateTaskStatus,
        createTaskNote,
        updateTaskNote,
        deleteTaskNote,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
