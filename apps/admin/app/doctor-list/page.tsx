// @ts-nocheck
"use client";
import { useContext, useEffect } from 'react';
import { AdminContext } from '@/src/context/AdminContext';
import { Star } from 'lucide-react';
import { PageContainer, PageHeader, Card, Badge } from '@/src/components/ui';

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken]);

  return (
    <PageContainer>
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.length} doctors across the platform`}
        actions={
          <Badge tone="primary" dot>{doctors.length} total</Badge>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {doctors.map((item, index) => (
          <Card
            key={index}
            hover
            padded={false}
            className="group overflow-hidden"
          >
            <div className="h-44 overflow-hidden bg-primary-soft transition-colors duration-500 group-hover:bg-primary">
              <img
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={item.image}
                alt=""
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-text-primary">{item.name}</p>
                  <p className="text-sm text-text-secondary">{item.speciality}</p>
                </div>
                <Badge tone={item.available ? "emerald" : "slate"} dot>
                  {item.available ? "Available" : "Away"}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-text-primary">
                  {item.ratingAverage ? item.ratingAverage.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-text-secondary">({item.ratingCount || 0})</span>
              </div>
              <label className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="font-medium text-text-secondary">Availability</span>
                <button
                  onClick={() => changeAvailability(item._id)}
                  className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${item.available ? 'bg-primary' : 'bg-background-muted-hover'}`}
                  aria-pressed={item.available}
                  title="Toggle availability"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${item.available ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </button>
              </label>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default DoctorsList;