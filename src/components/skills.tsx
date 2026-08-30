'use client';

import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Cloud,
  Code2,
  Compass,
  Database,
  LineChart,
  Server,
  Layout,
} from 'lucide-react';
import { getConfig } from '@/lib/config-loader';

const Skills = () => {
  const { skills } = getConfig();

  const sections = [
    { category: 'Languages', icon: Code2, skills: skills.languages },
    { category: 'Frontend', icon: Layout, skills: skills.frontend },
    { category: 'Backend', icon: Server, skills: skills.backend },
    { category: 'AI & LLM', icon: BrainCircuit, skills: skills.ai_llm },
    { category: 'Data & ML', icon: LineChart, skills: skills.data_ml },
    { category: 'Cloud & DevOps', icon: Cloud, skills: skills.cloud_devops },
    { category: 'Databases', icon: Database, skills: skills.databases },
    { category: 'Engineering practices', icon: Compass, skills: skills.practices },
  ].filter((s) => s.skills && s.skills.length > 0);

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-2">
      <header className="mb-6">
        <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
          Skills &amp; expertise
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Full-stack from database to interface, plus the modern AI/LLM toolchain.
        </p>
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {sections.map(({ category, icon: Icon, skills: list }) => (
          <motion.div
            key={category}
            variants={item}
            className="border-t border-border pt-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-clay" />
              <h3 className="text-[13px] font-semibold tracking-tight text-foreground">
                {category}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {list.map((skill) => (
                <span
                  key={skill}
                  className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-foreground/80 transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Skills;
