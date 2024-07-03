import { useState } from "react";
import { Item, ItemWithId } from "../Types";
import Modal from "./Modal";
import { create, edit, del, refresh, progress } from "../features/todo/todoSlice";


type ModalState = {
  modalIsEdit: boolean;
  activeItem: Item;
  progress?: number;
  errorMessage?: string;
}


function TodoContainer(props: {}) {

  const [viewCompleted, setViewCompleted] = useState<boolean>(false);
  const [modalState, setModalState] = useState<ModalState>({
    modalIsEdit: false,
    activeItem: { title: "", description: "", completed: false },
  });

  const [isInputting, setIsInputting] = useState<boolean>(false);
  const progressData = progress.useQuery(undefined);


  const todoStateRes = refresh.useQuery(undefined);
  const todoData = todoStateRes.data;

  const [ createTrigger, createData ] = create.useMutation();
  const [ delTrigger ] = del.useMutation();
  const [ editTrigger, editData ] = edit.useMutation();

  function displayCompleted(status: boolean) {
    if (status) {
      return setViewCompleted(true);
    } else {
      return setViewCompleted(false);
    }
  }

  function toggle() {
    progressData.refetch();
    createData.reset();
    editData.reset();
    if (isInputting) {
      setIsInputting(false);
    } else {
      setIsInputting(true);
    }
  }

  function handleDelete(id: string) {
    delTrigger(id);
  }

  function createItem() {
    const item = { title: "", description: "", completed: false };
    setModalState({ activeItem: item, modalIsEdit: false });
    setIsInputting(true);
  }

  function editItem(item: Item) {
    setModalState({ activeItem: item, modalIsEdit: true });
    setIsInputting(true);
  }

  function renderTabList() {
    return (
      <div className="my-5 tab-list">
        <span
          onClick={() => displayCompleted(true)}
          className={viewCompleted ? "active" : ""}
        >
          complete
        </span>
        <span
          onClick={() => displayCompleted(false)}
          className={viewCompleted ? "" : "active"}
        >
          Incomplete
        </span>
      </div>
    );
  }

  function renderItems() {
    if (todoData === undefined) {
      return;
    }
    const newItems = todoData.idOrder.filter(
      (id) => todoData.todoMap[id].completed === viewCompleted
    ).map((id) => { return {...todoData.todoMap[id], id}; });
    return newItems.map((item: ItemWithId) => (
      <li
        key={item.id}
        className="list-group-item todo-list-item"
      >
        <div className="d-flex justify-content-between align-items-center">
          <span
            className={`todo-title mr-2 ${viewCompleted ? "completed-todo" : ""}`}
            title={item.description}
          >
            {item.title}
          </span>
          <span>
            <button
              onClick={() => editItem(item)}
              className="btn btn-secondary mr-2"
            >
              {" "}
              Edit{" "}
            </button>
            <button onClick={() => handleDelete(item.id)} className="btn btn-danger">
              Delete{" "}
            </button>
          </span>
        </div>
        <img src={item.depiction as string} alt="depiction" />
      </li>
    ));
  }

  const errorMessage = (createData.error || editData.error) ? "Submit error" : undefined
  // const showModal = isInputting;

  const triggerSave = (item: Item) => modalState.modalIsEdit ? editTrigger(item) : createTrigger(item);

  return <div className="row ">
    <div className="col-md-6 col-sm-10 mx-auto p-0">
      <div className="card p-3">
        <div className="">
          <button onClick={createItem} className="btn btn-primary">
            Add task
          </button>
        </div>
        {renderTabList()}
        <ul className="list-group list-group-flush">{renderItems()}</ul>
      </div>
    </div>
    {isInputting
      && <Modal
        activeItem={modalState.activeItem}
        toggle={toggle}
        progress={progressData.data}
        errorMessage={errorMessage}
        onSave={(item) => triggerSave(item).unwrap().then(
          () => {
            setTimeout(
              () => {
                toggle();
              },
              500,
            )
          },
          (error) => {
            progressData.refetch();
            return error;
          },
      )}
      />}
  </div>;
}

export default TodoContainer;
