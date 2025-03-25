
INSERT INTO study_program_types (description) VALUES
('Bachillerato'),
('Bachillerato Técnico'),
('Técnico'),
('Licenciatura'),
('Ingeniería'),
('Doctorado'),
('Especialidad'),
('Maestría');

INSERT INTO study_programs (name, is_stem, type, years_to_complete) VALUES
('Bachillerato General', false, 1, 3),
('Bachillerato en Computación', true, 2, 3),
('Técnico Automotriz', false, 3, 2),
('Licenciatura en Administración de Empresas', false, 4, 4),
('Licenciatura en Psicología', false, 4, 4),
('Ingeniería Industrial', true, 5, 5),
('Ingeniería Mecánica', true, 5, 5),
('Medicina General', true, 6, 6),
('Especialidad en Medicina Interna', false, 7, 3),
('Maestría en Educación', false, 8, 2);