import React, { useEffect, useState, useCallback , useContext} from "react";
import Header from "./component/header";
import Main from "./component/main";
import useJwt from "@/utils/jwt/useJwt";
import { useSelector } from "react-redux";
import { LoaderContext } from "@/utils/context/ProgressLoader";

const HistoryMessage = () => {
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const { showProgress, hideProgress } = useContext(LoaderContext);
    const [searchTotal, setSearchTotal] = useState([]);
    const [searchMessage, setSearchMessage] = useState([]);
    const [query, setQuery] = useState("");

    const getMoreMessage = useCallback((lastId) => {
        useJwt
            .getMessages({ id: selectedRoom.id, last_message_id: lastId })
            .then((res) => {
                if (res.data.ResponseCode === 0) {
                    let data = res.data.ResponseResult;
                    // console.log(data);
                    setSearchTotal((prev) => [...prev, ...data]);
                    if (data.length === 100 && data[data.length - 1].id !== lastId) {
                        getMoreMessage(data[data.length - 1].id);
                    }
                } else {
                    console.log(res.data.ResponseCode);
                }
            })
            .catch((err) => console.log(err));
    }, [selectedRoom.id]);

    useEffect(() => {
        useJwt
            .getMessages({ id: selectedRoom.id })
            .then((res) => {
                if (res.data.ResponseCode === 0) {
                    let data = res.data.ResponseResult;
                    if (data.length < 100) {
                        setSearchTotal(data);
                    } else {
                        getMoreMessage(data[data.length - 1].id);
                    }
                } else {
                    console.log(res.data.ResponseCode);
                }
            })
            .catch((err) => console.log(err));
    }, [selectedRoom, getMoreMessage]);

    useEffect(()=>{
        showProgress()
        setTimeout(()=>{
            hideProgress()
        },2000)
    },[hideProgress, showProgress])

    return (
        <div>
            <Header searchTotal={searchTotal} setSearchMessage={setSearchMessage} setQuery={setQuery} query={query} />
            <Main searchMessage={searchMessage} query={query} />
        </div>
    );
};

export default HistoryMessage;