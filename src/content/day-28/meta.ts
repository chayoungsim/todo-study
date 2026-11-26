import type { DayMeta } from "../types";

const meta: DayMeta = {
  title: "데이터 변경과 캐시 갱신",
  minutes: 30,
  summary: "useMutation으로 서버 데이터를 바꾸고, invalidateQueries로 캐시를 갱신하는 흐름을 익힌다.",
  dependencies: { "@tanstack/react-query": "^5.0.0" },
};

export default meta;
