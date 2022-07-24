// frontend/src/App.js

import React, { useState } from "react";
import Modal from "./components/Modal";
import axios from "axios";
import { Item, ItemWithId } from "./Types";

function App(props: {}) {
  const [viewCompleted, setViewCompleted] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<Item>({
    title: "",
    description: "",
    completed: false,
  });
  const [todoList, setTodoList] = useState<ItemWithId[]>([]);
  const [modal, setModal] = useState<boolean>(false);

  function refreshList() {
    axios
      .get("/api/todos/")
      .then((res) => setTodoList(res.data))
      .catch((err) => console.log(err));
  }
  function displayCompleted(status: boolean) {
    if (status) {
      return setViewCompleted(true);
    } else {
      return setViewCompleted(false);
    }
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
    const newItems = todoList.filter(
      (item) => item.completed === viewCompleted
    );
    return newItems.map((item: ItemWithId) => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
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
          <button onClick={() => handleDelete(item)} className="btn btn-danger">
            Delete{" "}
          </button>
        </span>
      </li>
    ));
  }

  function toggle() {
    setModal(!modal);
  }

  function handleSubmit(item: Item) {
    toggle();
    if ("id" in item) {
      const itemWithId = item as ItemWithId;
      axios
        .put(`/api/todos/${itemWithId.id}/`, item)
        .then((res) => refreshList());
      return;
    } else {
      axios
        .post("/api/todos/", item)
        .then((res) => refreshList());
    }
  }
  function handleDelete(item: ItemWithId) {
    axios
      .delete(`/api/todos/${item.id}`)
      .then((res) => refreshList());
  }
  function createItem() {
    const item = { title: "", description: "", completed: false };
    setActiveItem(item);
    setModal(!modal);
  }
  function editItem(item: Item) {
    setActiveItem(item);
    setModal(!modal);
  }
  return (
    <main className="content">
      <h1 className="text-white text-uppercase text-center my-4">Todo app</h1>
      <div className="row ">
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
      </div>
      {modal ? (
        <Modal activeItem={activeItem} toggle={toggle} onSave={handleSubmit} />
      ) : null}
    </main>
  );
}
export default App;
