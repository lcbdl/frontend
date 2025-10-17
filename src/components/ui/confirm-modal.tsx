import i18n from "@/i18n";
import { createSignal, JSX } from "solid-js";
import { Button } from "./button";
import { Modal } from "./modal-dialog";

const [open, setOpen] = createSignal(false);
const [message, setMessage] = createSignal<string | JSX.Element>("");
let resolver: ((value: boolean) => void) | null = null;

export function ConfirmModal() {
  return (
    <Modal
      open={open()}
      onClose={() => handleAnswer(false)}
      title={i18n.t("common.warning")}
      containerClass="flex-col"
      showCloseButton={false}
      actions={
        <>
          <Button variant="default" onClick={() => handleAnswer(false)}>
            {i18n.t("common.cancel")}
          </Button>
          <Button variant="default" onClick={() => handleAnswer(true)}>
            {i18n.t("common.ok")}
          </Button>
        </>
      }
    >
      {message()}
    </Modal>
  );
}

function handleAnswer(answer: boolean) {
  setOpen(false);
  resolver?.(answer);
  resolver = null;
}

export function confirmDialog(msg: string | JSX.Element): Promise<boolean> {
  setMessage(msg);
  setOpen(true);
  return new Promise((resolve) => {
    resolver = resolve;
  });
}
