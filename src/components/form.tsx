import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  studentId: z
    .string()
    .length(10, { message: "The student id must be 10 characters long" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Group {
  date: string;
  time: string;
  code: string;
  title: string;
  sum_student: number;
  group: {
    building: string;
    room: string;
    students: number;
    range: string;
  }[];
}

export function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const response = await fetch(`/api/${data.studentId}`);
    const groups = await response.json();
    setGroups(groups);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("studentId")}
          placeholder="เลขประจำตัวนิสิต / Student ID"
        />
        <p>{errors.studentId?.message}</p>

        <input type="submit" />
      </form>
      {groups.map((group) => (
        <div key={group.code} className="flex gap-2">
          {selectedGroups.includes(group) ? (
            <button
              onClick={() =>
                setSelectedGroups(
                  selectedGroups.filter(
                    (selectedGroup) => selectedGroup !== group
                  )
                )
              }
            >
              ✅
            </button>
          ) : (
            <button
              onClick={() => setSelectedGroups([...selectedGroups, group])}
            >
              ❌
            </button>
          )}
          <h2>{group.title}</h2>
          <p>{group.code}</p>
        </div>
      ))}

      <div className="flex flex-col"></div>
    </>
  );
}
