"use client";

import axiosInstance from "@/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TypeMovie {
  id: number;
  typeName: string;
  createdDate: string | null;
  updatedTime: string | null;
}

interface ShowTime {
  id: number;
  startTime: string;
  endTime: string;
}

interface RoomDetails {
  id: number;
  nameRoom: string;
  seatQuantity: number;
}

interface MovieDetails {
  id: number;
  content: string;
  movieNameEnglish: string;
  movieNameVN: string;
  actor: string;
  director: string;
  duration: number;
  movieProductionCompany: string;
  startedDate: string;
  endDate: string;
  imageURL: string;
  version: string;
  room: Room;
  typeMovies: TypeMovie[];
  showTimes: ShowTime[];
}

interface Params {
  slug: string;
}

interface SearchParams {
  [key: string]: string;
}

interface Room {
  createdDate: string;
  id: number;
  roomName: string;
  seatQuantity: number;
  updatedTime: string;
}

export default function Home({
  params,
  searchParams,
}: Readonly<{
  params: Params;
  searchParams: SearchParams;
}>) {
  const router = useRouter();
  const id = searchParams.id;
  const [movieId, setMovieId] = useState(0);
  const [movieDetails, setMovieDetails] = useState<MovieDetails>();
  const [movNameEn, setMovNameEn] = useState("");
  const [movNameVie, setMovNameVie] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [actor, setActor] = useState("");
  const [movProductionComp, setMovProductionComp] = useState("");
  const [director, setDirector] = useState("");
  const [duration, setDuration] = useState("");
  const [version, setVersion] = useState("");
  const [rooms, setRooms] = useState<RoomDetails[]>([]);
  const [movType, setMovType] = useState<TypeMovie[]>([]);
  const [room, setRoom] = useState(1);
  const [schedule, setSchedule] = useState<ShowTime[]>([]);
  const [content, setContent] = useState("");
  const [imageName, setImageName] = useState("");
  const [fileName, setFileName] = useState<File>();
  const [notReload, setNotReload] = useState(true);

  const generateTimeSlots = (
    duration: any,
    interval: any,
    startHour: any,
    endHour: any
  ) => {
    const slots = [];
    let currentTime = new Date().setHours(startHour, 0, 0, 0);
    const endTime = new Date().setHours(endHour, 0, 0, 0);
    while (currentTime + Number(duration) * 60000 < endTime) {
      const slotTime = new Date(currentTime);
      slots.push(
        slotTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      currentTime += (Number(duration) + Number(interval)) * 60000;
    }
    return slots;
  };

  useEffect(() => {
    axiosInstance.get(`/api/room`).then((response) => {
      setRooms(response.data);
    });
  }, []);

  useEffect(() => {
    setSchedule([]);
  }, [duration]);

  useEffect(() => {
    async function getData() {
      await axiosInstance.get(`/api/movie/admin/${id}`).then((response) => {
        console.log(response.data);
        setMovieDetails(response.data);
      });
    }
    if (notReload) {
      getData();
      setNotReload(false);
    }
  }, [notReload]);

  useEffect(() => {
    setMovieId(movieDetails?.id || 0);
    setMovNameEn(movieDetails?.movieNameEnglish || "");
    setMovNameVie(movieDetails?.movieNameVN || "");
    setFromDate(movieDetails?.startedDate || "");
    setToDate(movieDetails?.endDate || "");
    setActor(movieDetails?.actor || "");
    setMovProductionComp(movieDetails?.movieProductionCompany || "");
    setDirector(movieDetails?.director || "");
    setDuration(movieDetails?.duration.toString() || "");
    setVersion(movieDetails?.version || "");
    setMovType(movieDetails?.typeMovies || []);
    setImageName(movieDetails?.imageURL || "");
    setRoom(movieDetails?.room?.id || 1);
    setSchedule(movieDetails?.showTimes || []);
    setContent(movieDetails?.content || "");
  }, [movieDetails]);

  const handleCheckBoxSchedule = (e: any) => {
    const { value, checked } = e.target;
    setSchedule((prev) => {
      // Convert the current time string to a ShowTime object or retrieve it if it already exists
      const timeObj: ShowTime = {
        id: prev.length,
        startTime: value,
        endTime: "",
      };
      if (checked) {
        // Add the time object to the array if checked
        return [...prev, timeObj];
      } else {
        // Remove the time object from the array if unchecked
        return prev.filter((time) => time.startTime.slice(0, 5) !== value);
      }
    });
  };

  const slots = generateTimeSlots(duration, 30, 8, 24);

  console.log(schedule)

  function handleUpdate(e: any) {
    e.preventDefault();
    axiosInstance
      .put("/api/movie", {
        id: movieId,
        content: content,
        movieNameEnglish: movNameEn,
        movieNameVN: movNameVie,
        actor: actor,
        director: director,
        movieProductionCompany: movProductionComp,
        startedDate: fromDate,
        endDate: toDate,
        duration: duration,
        imageURL: imageName,
        startTime: schedule.map((el) => el.startTime.slice(0, 5)),
        roomId: room,
        version: version,
        typeMovieId: movType.map((el) => Number(el.id)),
      })
      .then((response) => {
        router.push("/admin/dashboard/movies");
      });
  }

  function checkFormFilled() {
    const allStringsFilled =
      movNameEn &&
      movNameVie &&
      fromDate &&
      toDate &&
      actor &&
      movProductionComp &&
      director &&
      duration &&
      room &&
      content;
    const allArraysFilled = movType.length > 0 && schedule.length > 0;
    const fileSelected = fileName !== undefined;
    return allStringsFilled && allArraysFilled && fileSelected;
  }

  const handleFileChange = (e: any) => {
    setFileName(e.target.files[0]);
    setImageName(e.target.files[0].name);
    if (e.target.files[0]) {
      const form = new FormData();
      form.append("imageFile", e.target.files[0]);
      axiosInstance.post("/images", form);
    }
  };

  const handleCheckBoxType = (e: any, typeId: number) => {
    const checked = e.target.checked;
    if (checked) {
      const newType = {
        id: typeId,
        typeName: "",
        createdDate: null,
        updatedTime: null,
      };
      setMovType((prev) => [...prev, newType]);
    } else {
      setMovType((prev) => prev.filter((type) => type.id !== typeId));
    }
  };

  function handleClose() {
    router.push("/admin/dashboard/movies");
  }

  return (
    <div className="bg-[#EFF0F3] w-full h-full overflow-auto flex flex-col items-center text-black overflow-auto">
      <form
        className="w-[95%] bg-white m-10 p-10 flex flex-col gap-3"
        onSubmit={(e) => handleUpdate(e)}
      >
        <span className="block self-center font-bold text-[1.5rem]">
          UPDATE MOVIE
        </span>
        <div className="w-[40rem] h-[20rem] overflow-hidden mb-5 self-center">
          <img
            src={
              process.env.NEXT_PUBLIC_API_BASE_URL +
              "/images/" +
              movieDetails?.imageURL
            }
            alt=""
            className="w-full h-full object-cover border-[1px] border-black"
          />
        </div>
        <label
          htmlFor="movie_name"
          className="block text-sm font-medium text-gray-700"
        >
          Movie name (ENG):
          <span className="text-red-500">*</span>
        </label>
        <input
          id="movie_name"
          type="text"
          value={movNameEn}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setMovNameEn(e.target.value)}
        />
        <label
          htmlFor="movie_name_VN"
          className="block text-sm font-medium text-gray-700"
        >
          Movie name (VN):
          <span className="text-red-500">*</span>
        </label>
        <input
          id="movie_name_VN"
          type="text"
          value={movNameVie}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setMovNameVie(e.target.value)}
        />
        <label
          htmlFor="from_date"
          className="block text-sm font-medium text-gray-700"
        >
          From date:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="from_date"
          type="date"
          value={fromDate}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setFromDate(e.target.value)}
        />
        <label
          htmlFor="to_date"
          className="block text-sm font-medium text-gray-700"
        >
          To date:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="to_date"
          type="date"
          value={toDate}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setToDate(e.target.value)}
        />
        <label
          htmlFor="actor"
          className="block text-sm font-medium text-gray-700"
        >
          Actor:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="actor"
          type="text"
          value={actor}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setActor(e.target.value)}
        />
        <label
          htmlFor="movie_production_company"
          className="block text-sm font-medium text-gray-700"
        >
          Movie Production Company:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="movie_production_company"
          type="text"
          value={movProductionComp}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setMovProductionComp(e.target.value)}
        />
        <label
          htmlFor="director"
          className="block text-sm font-medium text-gray-700"
        >
          Director:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="director"
          type="text"
          value={director}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setDirector(e.target.value)}
        />
        <label
          htmlFor="duration"
          className="block text-sm font-medium text-gray-700"
        >
          Duration:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="duration"
          type="text"
          value={duration}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setDuration(e.target.value)}
        />
        <label
          htmlFor="duration"
          className="block text-sm font-medium text-gray-700"
        >
          Version:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="duration"
          type="text"
          value={version}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] p-2"
          onChange={(e) => setVersion(e.target.value)}
        />
        <label
          htmlFor="version"
          className="block text-sm font-medium text-gray-700 mt-2"
        >
          Type:
          <span className="text-red-500">*</span>
        </label>
        <div className="text-black w-[60%] gap-7 flex flex-row flex-wrap mt-6">
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="hd"
              type="checkbox"
              checked={movType.some((type) => type.id === 1)}
              value="1"
              onChange={(e) => handleCheckBoxType(e, 1)}
            />
            <label htmlFor="hd">Hành động</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="hh"
              type="checkbox"
              checked={movType.some((type) => type.id === 5)}
              value="5"
              onChange={(e) => handleCheckBoxType(e, 5)}
            />
            <label htmlFor="hh">Hài hước</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="lm"
              type="checkbox"
              checked={movType.some((type) => type.id === 9)}
              value="9"
              onChange={(e) => handleCheckBoxType(e, 9)}
            />
            <label htmlFor="lm">Lãng mạn</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="tc"
              type="checkbox"
              checked={movType.some((type) => type.id === 2)}
              value="2"
              onChange={(e) => handleCheckBoxType(e, 2)}
            />
            <label htmlFor="tc">Tình cảm</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="ct"
              type="checkbox"
              checked={movType.some((type) => type.id === 6)}
              value="6"
              onChange={(e) => handleCheckBoxType(e, 6)}
            />
            <label htmlFor="ct">Chiến tranh</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="kh"
              type="checkbox"
              checked={movType.some((type) => type.id === 10)}
              value="10"
              onChange={(e) => handleCheckBoxType(e, 10)}
            />
            <label htmlFor="kh">Kiếm hiệp</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="an"
              type="checkbox"
              checked={movType.some((type) => type.id === 3)}
              value="3"
              onChange={(e) => handleCheckBoxType(e, 3)}
            />
            <label htmlFor="an">Âm nhạc</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="kd"
              type="checkbox"
              checked={movType.some((type) => type.id === 7)}
              value="7"
              onChange={(e) => handleCheckBoxType(e, 7)}
            />
            <label htmlFor="kd">Kinh dị</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="tl"
              type="checkbox"
              checked={movType.some((type) => type.id === 4)}
              value="4"
              onChange={(e) => handleCheckBoxType(e, 4)}
            />
            <label htmlFor="tl">Tâm lý 18+</label>
          </div>
          <div className="w-[calc(30%)] flex flex-row items-center gap-2">
            <input
              id="hh2"
              type="checkbox"
              checked={movType.some((type) => type.id === 8)}
              value="8"
              onChange={(e) => handleCheckBoxType(e, 8)}
            />
            <label htmlFor="hh2">Hoạt hình</label>
          </div>
        </div>
        <label
          htmlFor="sched"
          className="block text-sm font-medium text-gray-700"
        >
          Cinema room:
          <span className="text-red-500">*</span>
        </label>
        <select
          id="sched"
          value={room}
          className="text-black h-10 rounded-[5px] border-[1px] border-black border-solid p-2"
          onChange={(e) => setRoom(Number(e.target.value))}
        >
          {rooms.map((el) => (
            <option value={el.id}>{el.nameRoom}</option>
          ))}
        </select>
        <label
          htmlFor="version"
          className="block text-sm font-medium text-gray-700 mt-2"
        >
          Schedule:
          <span className="text-red-500">*</span>
        </label>
        <div className="text-black w-[60%] gap-7 flex flex-row flex-wrap mt-5">
          {slots?.map((time, index) => (
            <div
              key={index}
              className="w-[calc(30%)] flex flex-row items-center gap-2"
            >
              <input
                id={`time_${index}`}
                type="checkbox"
                // Check if the current time string exists in the start times of the `schedule` state
                checked={schedule.some(
                  (showTime) => showTime.startTime.slice(0, 5) === time
                )}
                value={time}
                onChange={(e) => handleCheckBoxSchedule(e)}
              />
              <label htmlFor={`time_${index}`}>{time}</label>
            </div>
          ))}
        </div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content:
          <span className="text-red-500">*</span>
        </label>
        <input
          id="content"
          type="textarea"
          value={content}
          className="border-solid border-[1px] border-[#BEC8CF] rounded-[5px] h-10 p-2"
          onChange={(e) => setContent(e.target.value)}
        />
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mr-2 mb-3"
          >
            Image:
            <span className="text-red-500">*</span>
          </label>
          <div className="border-[1px] border-solid border-black rounded-[5px] p-1">
            <button
              type="button"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="bg-gray-200 rounded p-1 text-sm mr-4 text-black" // Added mr-4 for margin to the right of the button
            >
              Choose File
            </button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            {imageName && (
              <span className="text-sm text-black">{imageName}</span>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center gap-4 mt-5">
          <button
            type="submit"
            className="p-2 bg-[#337AB7] w-[5rem] rounded-[5px] text-white"
          >
            Save
          </button>
          <button
            type="reset"
            className="p-2 bg-[#337AB7] w-[5rem] rounded-[5px] text-white"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
}