import { useSelector } from "react-redux";
import { socketSelector } from "../redux/selectors/socket";

export default function useSocket() {
  const socket = useSelector(socketSelector);

  return socket;
}
