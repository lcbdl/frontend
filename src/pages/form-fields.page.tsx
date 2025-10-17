import { Button } from "@/components/ui/button";
import { isValidTime } from "@/components/ui/date-time/time-input";
import { CheckboxField } from "@/components/ui/form-fields/checkbox-field";
import { DateField } from "@/components/ui/form-fields/date-field";
import { MaskedInputField } from "@/components/ui/form-fields/masked-input-field";
import { RadioButtonField } from "@/components/ui/form-fields/radio-button-field";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { TextArea } from "@/components/ui/form-fields/text-area-field";
import { TextField } from "@/components/ui/form-fields/text-field";
import { TimeField } from "@/components/ui/form-fields/time-field";
import { ToggleSwitch } from "@/components/ui/form-fields/toggle-switch-field";

import {
  createForm,
  custom,
  email,
  maxRange,
  minRange,
  pattern,
  required,
  reset,
  SubmitHandler,
} from "@modular-forms/solid";
import dayjs from "dayjs";
import { omit } from "lodash";
import { type Component } from "solid-js";

type SampleForm = {
  numValue: number;
  emailValue: string;
  disabledValue: string;
  checkboxValue: {
    strArr: string[];
    boolValue1: boolean;
    boolValue2: boolean;
  };
  radioValue: {
    boolValue1: boolean;
    boolValue2: boolean;
  };
  selectValue: {
    singleValue: string;
    multiValue: string[];
  };
  DOB: string;
  textAreaValue: string;
  toggleValue: boolean;
  toggleValue2: boolean;
  workTimeStart: string;
  workTimeEnd: string;
  telephone: string;
  postalCode: string;
};

export const FormFieldsPage: Component = () => {
  const [form, { Form, Field }] = createForm<SampleForm>({
    initialValues: {
      numValue: 2,
      emailValue: "",
      disabledValue: "hello",
      checkboxValue: {
        strArr: [],
        boolValue1: true,
        boolValue2: false,
      },
      selectValue: {
        singleValue: "",
        multiValue: [],
      },
      textAreaValue: "",
      DOB: "2025-05-20",
      workTimeEnd: "16:00",
      workTimeStart: "08:00",
    },
  });

  const handleSubmit: SubmitHandler<SampleForm> = (values) => {
    console.log(values);
    reset(form);
  };

  return (
    <>
      <h1>Form Fields</h1>
      <Form onSubmit={handleSubmit}>
        <div class="rounded-lg p-5">
          <div class="flex flex-row gap-5">
            {/* left side */}
            <div class="grid w-full max-w-xs grid-cols-1 gap-6 rounded-lg bg-white p-5">
              <Field
                name="numValue"
                type="number"
                validate={[
                  required("Please input a number"),
                  minRange(10, "The value can not be less than 10"),
                  maxRange(100, "The value can not be greater than 100"),
                ]}
              >
                {(field, props) => (
                  <TextField
                    {...props}
                    type="number"
                    label="Number Field"
                    value={field.value}
                    error={field.error}
                    required
                  />
                )}
              </Field>
              <Field
                name="emailValue"
                type="string"
                validate={[required("Please enter your email"), email("Please enter a valid email address")]}
              >
                {(field, props) => (
                  <TextField
                    {...props}
                    label="Email Field"
                    type="email"
                    value={field.value}
                    error={field.error}
                    required
                  />
                )}
              </Field>
              <Field
                name="telephone"
                type="string"
                validate={[
                  required("Please enter your phone number"),
                  pattern(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number in the format (123) 456-7890"),
                ]}
              >
                {(field, props) => (
                  <MaskedInputField
                    mask={"(999) 999-9999"}
                    placeholder="(123) 456-7890"
                    {...props}
                    label="Telephone"
                    type="tel"
                    value={field.value}
                    error={field.error}
                    required
                  />
                )}
              </Field>
              <Field
                name="postalCode"
                type="string"
                validate={[
                  required("Please enter your postal code"),
                  pattern(
                    /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
                    "Please enter a valid postal code in the format A1B 2C3",
                  ),
                ]}
              >
                {(field, props) => (
                  <MaskedInputField
                    mask={"a9a 9a9"}
                    placeholder="A1B 2C3"
                    transform={(value) => value.toUpperCase()}
                    {...props}
                    label="Postal Code"
                    type="text"
                    value={field.value}
                    error={field.error}
                    required
                  />
                )}
              </Field>
              <Field name="disabledValue" type="string">
                {(field, props) => (
                  <TextField
                    {...props}
                    label="Disabled"
                    type="email"
                    disabled
                    value={field.value}
                    error={field.error}
                    required
                  />
                )}
              </Field>

              <Field
                name="DOB"
                type="string"
                validate={[
                  required("Please enter your date of birth"),
                  custom((value) => {
                    const newDate = dayjs(value, "MM/DD/YYYY", true);
                    return newDate.isValid() && newDate.format("MM/DD/YYYY") === value;
                  }, "Please enter a valid date"),
                ]}
              >
                {(field, props) => (
                  <DateField
                    {...omit(props, "onChange")}
                    required
                    label="DOB"
                    value={field.value}
                    error={field.error}
                    onInput={(e) => {
                      props.onInput(e);
                    }}
                  />
                )}
              </Field>

              <Field
                name="workTimeStart"
                type="string"
                validate={[
                  required("Please enter start working time"),
                  custom((value) => !!value && isValidTime(value), "Please enter a valid time"),
                ]}
              >
                {(field, props) => (
                  <TimeField
                    {...field}
                    required
                    label="Start Working Time"
                    onInput={(e) => {
                      props.onInput(e);
                    }}
                  />
                )}
              </Field>

              <Field
                name="workTimeEnd"
                type="string"
                validate={[
                  required("Please enter end working time"),
                  custom((value) => !!value && isValidTime(value), "Please enter a valid time"),
                ]}
              >
                {(field, props) => (
                  <TimeField
                    {...field}
                    required
                    label="End Working Time"
                    onInput={(e) => {
                      props.onInput(e);
                    }}
                  />
                )}
              </Field>
            </div>
            {/* right side */}
            <div class="grid w-full max-w-xs grid-cols-1 gap-6 rounded-lg bg-white p-5">
              <Field
                name="checkboxValue.boolValue1"
                type="boolean"
                validate={[required("You must agree to continue.")]}
              >
                {(field, props) => (
                  <CheckboxField
                    {...props} // contains onChange and value
                    label="Agree to terms"
                    value={field.value ?? false}
                    onChange={(field as any).setValue}
                    error={field.error}
                    required
                  />
                )}
              </Field>

              <Field name="checkboxValue.boolValue2" type="boolean">
                {(field, props) => (
                  <CheckboxField
                    {...props} // contains onChange and value
                    label="Agree to News letter"
                    value={field.value ?? false}
                    onChange={(field as any).setValue}
                    error={field.error}
                    disabled
                    required={false}
                  />
                )}
              </Field>

              <Field name="checkboxValue.strArr" type="string[]" validate={[required("You must select one.")]}>
                {(field, props) => (
                  <CheckboxField
                    {...props} // contains onChange and value
                    label="Please select a colour"
                    options={[
                      { label: "Red", value: "#FF0000" },
                      { label: "Green", value: "#00FF00" },
                      { label: "Blue", value: "#0000FF" },
                      { label: "Yellow", value: "#FFFF00" },
                      { label: "Purple", value: "#800080" },
                    ]}
                    value={field.value ?? []}
                    onChange={(field as any).setValue}
                    error={field.error}
                    required
                  />
                )}
              </Field>
              <Field name="radioValue.boolValue1" type="boolean" validate={[required("You must agree to continue.")]}>
                {(field, props) => (
                  <RadioButtonField
                    {...props}
                    label="Do you agree to the terms?"
                    value={field.value ?? false}
                    onChange={(field as any).setValue}
                    error={field.error}
                    required
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                  />
                )}
              </Field>

              <Field name="radioValue.boolValue2" type="boolean">
                {(field, props) => (
                  <RadioButtonField
                    {...props}
                    label="Does not apply"
                    value={field.value ?? false}
                    onChange={(field as any).setValue}
                    error={field.error}
                    disabled={true}
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                  />
                )}
              </Field>

              <Field name="selectValue.multiValue" type="string[]">
                {(field, props) => (
                  <SelectField
                    {...props}
                    label="Colours"
                    placeholder="Select colours"
                    value={field.value ?? []}
                    onChange={(field as any).setValue}
                    multiple={true}
                    error={field.error}
                    options={[
                      { label: "Red", value: "#FF0000" },
                      { label: "Green", value: "#00FF00" },
                      { label: "Blue", value: "#0000FF" },
                      { label: "Yellow", value: "#FFFF00" },
                      { label: "Purple", value: "#800080" },
                      { label: "Orange", value: "#430000" },
                    ]}
                  />
                )}
              </Field>

              <Field name="selectValue.singleValue" type="string" validate={[required("Please select a value.")]}>
                {(field, props) => (
                  <SelectField
                    {...props}
                    label="Colours"
                    placeholder="Select one colour"
                    value={field.value ?? ""}
                    multiple={false}
                    onChange={(field as any).setValue}
                    error={field.error}
                    options={[
                      { label: "Red", value: "#FF0000" },
                      { label: "Green", value: "#00FF00" },
                      { label: "Blue", value: "#0000FF" },
                      { label: "Yellow", value: "#FFFF00" },
                      { label: "Purple", value: "#800080" },
                      { label: "Orange", value: "#430000" },
                    ]}
                  />
                )}
              </Field>

              <Field name="toggleValue" type="boolean" validate={[required("Please enable notifications.")]}>
                {(field, props) => (
                  <ToggleSwitch
                    {...props}
                    label="Turn on notifications"
                    value={field.value}
                    onChange={(field as any).setValue}
                    error={field.error}
                    required
                  />
                )}
              </Field>
              <Field name="toggleValue2" type="boolean">
                {(field, props) => (
                  <ToggleSwitch
                    {...props}
                    label="Turn on dark mode"
                    value={field.value}
                    onChange={(field as any).setValue}
                    error={field.error}
                  />
                )}
              </Field>

              <Field name="textAreaValue" type="string">
                {(field, props) => (
                  <TextArea
                    {...props}
                    label="Leave a comment"
                    value={field.value}
                    onChange={(field as any).setValue}
                    error={field.error}
                  />
                )}
              </Field>
            </div>
          </div>
          <div class="mt-4 flex justify-start">
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </Form>
    </>
  );
};
