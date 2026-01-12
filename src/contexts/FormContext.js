"use client";

import { createContext, useContext, useState } from "react";

const FormContext = createContext({});

export function FormProvider({ children }) {
  const sessionStorage = typeof window !== "undefined" ? window?.sessionStorage : null;
  const [agree, setAgree] = useState(sessionStorage?.getItem("agree") || "no");
  const [name, setName] = useState(sessionStorage?.getItem("name") || "");
  const [tel1, setTel1] = useState(sessionStorage?.getItem("tel1") || "");
  const [tel2, setTel2] = useState(sessionStorage?.getItem("tel2") || "");
  const [tel3, setTel3] = useState(sessionStorage?.getItem("tel3") || "");
  const [email, setEmail] = useState(sessionStorage?.getItem("email") || "");
  const [userData, setUserData] = useState(sessionStorage?.getItem("userData") ? JSON.parse(sessionStorage.getItem("userData")) : null);
  const [inputData, setInputData] = useState(sessionStorage?.getItem("inputData") ? JSON.parse(sessionStorage.getItem("inputData")) : null);
  
  const setField = (key, value, set) => {
    const newSessionValue = typeof value === "object" ? JSON.stringify(value) : value;
    sessionStorage?.setItem(key, newSessionValue);
    set(value);
  }

  return (
    <FormContext.Provider
      value={{
        agree,
        setAgree: (value) => setField("agree", value, setAgree),
        name,
        setName: (value) => setField("name", value, setName),
        tel1,
        setTel1: (value) => setField("tel1", value, setTel1),
        tel2,
        setTel2: (value) => setField("tel2", value, setTel2),
        tel3,
        setTel3: (value) => setField("tel3", value, setTel3),
        email,
        setEmail: (value) => setField("email", value, setEmail),
        userData,
        setUserData: (value) => setField("userData", value, setUserData),
        inputData,
        setInputData: (value) => setField("inputData", value, setInputData),
        clearForm: () => {
          sessionStorage?.removeItem("agree");
          sessionStorage?.removeItem("name");
          sessionStorage?.removeItem("tel1");
          sessionStorage?.removeItem("tel2");
          sessionStorage?.removeItem("tel3");
          sessionStorage?.removeItem("email");
          sessionStorage?.removeItem("userData");
          sessionStorage?.removeItem("inputData");
          setAgree("no");
          setName("");
          setTel1("");
          setTel2("");
          setTel3("");
          setEmail("");
          setUserData(null);
          setInputData(null);
        },
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  return useContext(FormContext);
}
