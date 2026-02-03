"use client";

import { useEffect, useMemo, useState } from "react";

type Question = {
  a: number;
  b: number;
  op: "+" | "-" | "×";
  answer: number;
};

function makeQuestion(): Question {
  const opRoll = Math.random();
  let op: Question["op"] = "+";
  if (opRoll > 0.66) op = "×";
  else if (opRoll > 0.33) op = "-";

  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 2;
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;

  return { a, b, op, answer };
}

export default function MathDash() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!question) {
      setQuestion(makeQuestion());
    }
  }, [question]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      setDone(true);
      setBest((b) => Math.max(b, score));
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [running, timeLeft, score]);

  const placeholder = useMemo(
    () => (running ? "Type answer and press Enter" : "Press Start"),
    [running]
  );

  function start() {
    setScore(0);
    setTimeLeft(20);
    setQuestion(makeQuestion());
    setInput("");
    setRunning(true);
    setDone(false);
  }

  function submit() {
    if (!running || !question) return;
    const value = Number(input);
    if (!Number.isNaN(value) && value === question.answer) {
      setScore((s) => s + 1);
    }
    setQuestion(makeQuestion());
    setInput("");
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(3,7,18,0.45)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white">Math Dash</div>
          <div className="mt-1 text-sm text-slate-300">
            Solve as many as you can in 20 seconds.
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div>
            Time <span className="font-semibold text-white">{timeLeft}s</span>
          </div>
          <div>
            Score <span className="font-semibold text-white">{score}</span>
          </div>
          <div>
            Best <span className="font-semibold text-white">{best}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-3xl font-semibold text-white">
          {question ? `${question.a} ${question.op} ${question.b} = ?` : "—"}
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={placeholder}
            disabled={!running}
            className="h-11 w-56 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-[#22d3ee]"
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={running ? submit : start}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#22d3ee] px-6 text-sm font-semibold text-[#0b1020] transition hover:-translate-y-0.5 hover:opacity-90"
          >
            {running ? "Submit" : "Start"}
          </button>
        </div>
      </div>

      {done && (
        <div className="mt-4 text-sm text-slate-300">
          Time’s up! You solved {score} problems. Press Start to try again.
        </div>
      )}
    </div>
  );
}
