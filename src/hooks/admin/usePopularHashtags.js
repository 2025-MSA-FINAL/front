import { useState, useEffect } from "react";
import axiosInstance from "@/api/axios";

export default function usePopularHashtags() {
  const [hashtags, setHashtags] = useState([]);
  const [gender, setGender] = useState("all"); // 기본 전체
  const [age, setAge] = useState("all");       // 기본 전체
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHashtags();
  }, [gender, age]);

  const fetchHashtags = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/api/admin/dashboard/hashtags", {
        params: {
          gender: gender === "all" ? null : gender,
          ageGroup: age === "all" ? null : age,
        },
      });

    const transformed = res.data.map(item => ({
        name: item.hashName,
        value: item.wishlistCount
      }));
      setHashtags(transformed);  

      
    } catch (err) {
      console.error("해시태그 불러오기 오류:", err);
      setHashtags([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    hashtags,
    gender,
    age,
    setGender,
    setAge,
    loading,
  };
}