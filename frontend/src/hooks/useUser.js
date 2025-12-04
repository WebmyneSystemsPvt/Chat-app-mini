import { useSelector } from "react-redux";
import { userSelector } from "../redux/selectors/user";

export default function useUser() {
  const user = useSelector(userSelector);

  return user;
}
