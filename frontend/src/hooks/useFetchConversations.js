import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { conversationAPI } from "../services/api";
import { setConversations } from "../redux/actions/conversationActions";

export default function useFetchConversations() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  function fetchConversations() {
    setLoading(true);
    conversationAPI
      .getAll()
      .then((res) => {
        const convs = res?.data?.data || [];
        if (convs) dispatch(setConversations(convs));
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong while fetching conversations!");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return [fetchConversations, loading];
}
