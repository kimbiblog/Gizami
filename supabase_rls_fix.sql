-- 1. MODULES: Explicit policies
DROP POLICY IF EXISTS "Instructors can manage modules for their courses" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
DROP POLICY IF EXISTS "modules_select" ON public.modules;
DROP POLICY IF EXISTS "modules_insert" ON public.modules;
DROP POLICY IF EXISTS "modules_update" ON public.modules;
DROP POLICY IF EXISTS "modules_delete" ON public.modules;

CREATE POLICY "modules_select" ON public.modules FOR SELECT USING (true);

CREATE POLICY "modules_insert" ON public.modules FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND instructor_id = auth.uid()
  )
);

CREATE POLICY "modules_update" ON public.modules FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND instructor_id = auth.uid()
  )
);

CREATE POLICY "modules_delete" ON public.modules FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND instructor_id = auth.uid()
  )
);

-- 2. LESSONS: Explicit policies
DROP POLICY IF EXISTS "Instructors can manage lessons for their modules" ON public.lessons;
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "lessons_select" ON public.lessons;
DROP POLICY IF EXISTS "lessons_insert" ON public.lessons;
DROP POLICY IF EXISTS "lessons_update" ON public.lessons;
DROP POLICY IF EXISTS "lessons_delete" ON public.lessons;

CREATE POLICY "lessons_select" ON public.lessons FOR SELECT USING (true);

CREATE POLICY "lessons_insert" ON public.lessons FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.modules
    JOIN public.courses ON modules.course_id = courses.id
    WHERE modules.id = module_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "lessons_update" ON public.lessons FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.modules
    JOIN public.courses ON modules.course_id = courses.id
    WHERE modules.id = module_id 
    AND courses.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.modules
    JOIN public.courses ON modules.course_id = courses.id
    WHERE modules.id = module_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "lessons_delete" ON public.lessons FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.modules
    JOIN public.courses ON modules.course_id = courses.id
    WHERE modules.id = module_id 
    AND courses.instructor_id = auth.uid()
  )
);

-- 3. COURSES: (Ensure these are solid)
DROP POLICY IF EXISTS "Instructors can update their own courses" ON public.courses;
CREATE POLICY "Instructors can update their own courses" ON public.courses
    FOR UPDATE 
    USING (auth.uid() = instructor_id)
    WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can delete their own courses" ON public.courses;
CREATE POLICY "Instructors can delete their own courses" ON public.courses
    FOR DELETE 
    USING (auth.uid() = instructor_id);
