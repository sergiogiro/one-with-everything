import axios from "axios";
import { AxiosResponse } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Item, ItemWithId } from "../Types";
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { create, edit, del, refresh } from "../features/todo/todoSlice";
import { RootState } from "../Redux";


type ModalState = {
  showModal: boolean;
  modalIsEdit: boolean;
  activeItem: Item;
  progress?: number;
  errorMessage?: string;
}


function TodoContainer(props: {}) {

  const [viewCompleted, setViewCompleted] = useState<boolean>(false);
  const [modalState, setModalState] = useState<ModalState>({
    showModal: false,
    modalIsEdit: false,
    activeItem: { title: "", description: "", completed: false },
  });

  const dispatch = useDispatch();

  const refreshList = useCallback(() => {
    axios
      .get("/api/todos/")
      .then((res) => dispatch(refresh(res.data)))
      .catch((err) => console.log(err));
  }, [dispatch]);


  useEffect(() => refreshList(), [refreshList]);

  const { idOrder, todoMap } = useSelector((state: RootState) => state.todo);

  function displayCompleted(status: boolean) {
    if (status) {
      return setViewCompleted(true);
    } else {
      return setViewCompleted(false);
    }
  }

  function toggle() {
    setModalState({ ...modalState, showModal: !modalState.showModal });
  }

  function handleSubmit(item: Item) {
    const formData = new FormData();
    formData.append("title", item.title);
    formData.append("description", item.description);
    formData.append("completed", item.completed.toString());
    if (item.depiction && typeof item.depiction !== "string") {
      formData.append("depiction", item.depiction as Blob);
    }
    let requestPath = "/api/todos/";
    let httpMethod = axios.post;
    let isEdit = false;
    if ("id" in item) {
      httpMethod = axios.put;
      const itemWithId = item as ItemWithId;
      requestPath = requestPath + itemWithId.id + "/";
      isEdit = true;
    }

    httpMethod(requestPath, formData, {
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 100 - 2;
        setModalState({ ...modalState, progress: progress });
      }
    })
      .then((res: AxiosResponse<any>) => handleSubmitSuccess(isEdit, res))
      .catch((_) => { setModalState({ ...modalState, progress: undefined, errorMessage: "Error uploading" }); })
  }

  function handleSubmitSuccess(isEdit: boolean, res: AxiosResponse<any>): void {
    setModalState({ ...modalState, progress: 100 });
    setTimeout(() => {
      setModalState({ ...modalState, showModal: false, progress: undefined, errorMessage: "" });
      dispatch(isEdit ? edit(res.data) : create(res.data));
    }, 500);
  }

  function handleDelete(id: string) {
    axios
      .delete(`/api/todos/${id}`)
      .then((res) => dispatch(del(id)));
  }
  function createItem() {
    const item = { title: "", description: "", completed: false };
    setModalState({ activeItem: item, showModal: true, modalIsEdit: false });
  }
  function editItem(item: Item) {
    setModalState({ activeItem: item, showModal: true, modalIsEdit: true });
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
    const newItems = idOrder.filter(
      (id) => todoMap[id].completed === viewCompleted
    ).map((id) => { return {...todoMap[id], id}; });
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
    {modalState.showModal
      && <Modal
        activeItem={modalState.activeItem}
        toggle={toggle}
        onSave={handleSubmit}
        isEdit={modalState.modalIsEdit}
        progress={modalState.progress}
        errorMessage={modalState.errorMessage}
      />}
  </div>;
}

export default TodoContainer;
