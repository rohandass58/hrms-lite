import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from employees.models import Employee
from attendance.models import Attendance


class Command(BaseCommand):
    help = "Seed the database with sample employees and attendance records"

    def add_arguments(self, parser):
        parser.add_argument(
            "--employees",
            type=int,
            default=10,
            help="Number of employees to create (default: 10)",
        )
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Number of days of attendance records to create (default: 30)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding",
        )

    def handle(self, *args, **options):
        num_employees = options["employees"]
        num_days = options["days"]
        clear = options["clear"]

        if clear:
            self.stdout.write(self.style.WARNING("Clearing existing data..."))
            Attendance.objects.all().delete()
            Employee.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Existing data cleared."))

        # Sample data
        departments = [
            "Engineering",
            "Marketing",
            "Sales",
            "HR",
            "Finance",
            "Operations",
            "Product",
            "Design",
        ]

        # Cricket player names
        cricket_first_names = [
            "Virat", "Rohit", "MS", "Sachin", "Rahul", "Rishabh", "Hardik", "Jasprit",
            "Ravindra", "Shubman", "Ishan", "Suryakumar", "KL", "Yuzvendra", "Mohammed",
            "Ravichandran", "Bhuvneshwar", "Shikhar", "Ajinkya", "Cheteshwar", "Rishabh",
            "Dinesh", "Wriddhiman", "Umesh", "Ishant", "Kuldeep", "Axar", "Washington",
            "Mayank", "Prithvi", "Shreyas", "Deepak", "Navdeep", "Trent", "Kane",
            "Steve", "David", "Pat", "Mitchell", "Josh", "Glenn", "Aaron", "Tim",
            "Ben", "Joe", "Jonny", "Jos", "Eoin", "Stuart", "James", "Chris",
        ]

        cricket_last_names = [
            "Kohli", "Sharma", "Dhoni", "Tendulkar", "Dravid", "Pant", "Pandya", "Bumrah",
            "Jadeja", "Gill", "Kishan", "Yadav", "Rahul", "Chahal", "Shami", "Ashwin",
            "Kumar", "Dhawan", "Rahane", "Pujara", "Saha", "Karthik", "Yadav", "Sharma",
            "Yadav", "Patel", "Sundar", "Agarwal", "Shaw", "Iyer", "Chahar", "Saini",
            "Boult", "Williamson", "Smith", "Warner", "Cummins", "Starc", "Hazlewood",
            "Finch", "Paine", "Lyon", "Stokes", "Root", "Bairstow", "Buttler", "Morgan",
            "Broad", "Anderson", "Woakes", "Archer", "Bairstow", "Buttler", "Morgan",
        ]

        first_names = cricket_first_names
        last_names = cricket_last_names

        # Create employees (cricket players)
        self.stdout.write(self.style.SUCCESS(f"Creating {num_employees} cricket players as employees..."))
        employees = []
        
        for i in range(1, num_employees + 1):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            full_name = f"{first_name} {last_name}"
            employee_id = f"CRK{i:03d}"  # CRK prefix for cricket players
            email = f"{first_name.lower()}.{last_name.lower()}@cricket.com"
            department = random.choice(departments)

            # Handle duplicate emails
            counter = 1
            original_email = email
            while Employee.objects.filter(email=email).exists():
                email = f"{first_name.lower()}.{last_name.lower()}{counter}@cricket.com"
                counter += 1

            employee = Employee.objects.create(
                employee_id=employee_id,
                full_name=full_name,
                email=email,
                department=department,
            )
            employees.append(employee)
            if i <= 10 or i % 50 == 0:  # Show first 10 and every 50th
                self.stdout.write(f"  Created: {employee}")

        self.stdout.write(self.style.SUCCESS(f"Created {len(employees)} employees."))

        # Create attendance records - target 500 records
        target_records = 500
        self.stdout.write(self.style.SUCCESS(f"Creating {target_records} attendance records..."))
        
        today = date.today()
        attendance_count = 0
        max_days_back = 365  # Look back up to 1 year
        
        # Calculate how many records per employee to reach target
        records_per_employee = max(1, target_records // len(employees)) if employees else 0
        
        for employee in employees:
            employee_records = 0
            day_offset = 0
            
            while employee_records < records_per_employee and day_offset < max_days_back:
                record_date = today - timedelta(days=day_offset)
                
                # Skip weekends
                if record_date.weekday() < 5:  # Monday to Friday
                    # 85% chance of being present, 15% chance of being absent
                    status = "Present" if random.random() < 0.85 else "Absent"
                    
                    # Check if attendance already exists for this employee and date
                    if not Attendance.objects.filter(employee=employee, date=record_date).exists():
                        Attendance.objects.create(
                            employee=employee,
                            date=record_date,
                            status=status,
                        )
                        attendance_count += 1
                        employee_records += 1
                        
                        if attendance_count >= target_records:
                            break
                
                day_offset += 1
            
            if attendance_count >= target_records:
                break

        self.stdout.write(self.style.SUCCESS(f"Created {attendance_count} attendance records."))
        self.stdout.write(self.style.SUCCESS("\nDatabase seeding completed successfully!"))

