// frontend/src/components/Modal.js

import { FileUploader } from "react-drag-drop-files";
import React, { ChangeEvent, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Item } from "../Types";

export default function CustomModal(props: {
  activeItem: Item;
  toggle: () => void;
  onSave: (item: Item) => void;
  isEdit?: boolean;
}) {
  const [activeItem, setActiveItem] = useState<Item>(props.activeItem);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target !== null) {
      const name = e.target.name;
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setActiveItem({ ...activeItem, [name]: value });
    }
  }

  function handleFileNameChange(depiction: File) {
    setActiveItem({ ...activeItem, depiction });
  }

  const { toggle, onSave, isEdit } = props;

  const depictionLabel = "Depiction" + (isEdit ? " (Drop to override)" : "")

  return (
    <Modal isOpen={true} toggle={toggle}>
      <ModalHeader toggle={toggle}> Todo Item </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="title">Title</Label>
            <Input
              type="text"
              name="title"
              value={activeItem.title}
              onChange={handleChange}
              placeholder="Enter Todo Title"
            />
          </FormGroup>
          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="text"
              name="description"
              value={activeItem.description}
              onChange={handleChange}
              placeholder="Enter Todo description"
            />
          </FormGroup>
          <FormGroup>
            <Label for="depiction">{depictionLabel}</Label>
            <FileUploader
              handleChange={handleFileNameChange}
              name="depictionFile"
              types={["png", "jpg", "jpeg", "webp"]}
              label={"Drop a file here or click to upload"}
            />
          </FormGroup>
          <FormGroup check>
            <Label for="completed">
              <Input
                type="checkbox"
                name="completed"
                checked={activeItem.completed}
                onChange={handleChange}
              />
              Completed
            </Label>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={() => onSave(activeItem)}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
}
