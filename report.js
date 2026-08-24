// ====================================================
// LARVA SURVEY APP – Report Builder & PDF Generator
// ====================================================

'use strict';

// ====================================================
// LARVA STATUS ICONS (small PNGs, embedded as base64 so the
// PDF never depends on a font/emoji rendering correctly, or on
// a network fetch that could fail in the field)
// ====================================================
const ICON_FOUND_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAhxElEQVR42u19e5SU1ZXvb+9zvq8eXd3N0+DkCigICr5bxdHEahQREJ9Y7SsTE+8kjmtlYu4k68517poUveZOVrKSTBJz742ajDcaQewSVERFFLs7PhIiqInSRKOgGF+g0q/qenznnH3/qCpoEORVVd1gHVavZnV/VV3ft3/7cfb57b0Jh9oSUCKV4C1jt1DnzE6z66+b1jZFQy50lDNuCglNJaaJEExg4nFENBKEegBRBocIpImJCGQABAAyTNxHRN0AtoKxmYnfZMWvWWM3+dbfuOL0FR/u+jfj7XENAJ0dnQ6tcIfS46RD5XMm2hKMBJCilB38i1NXnzpB+/o0gcxg8Cmk6FgIjlS+iihPAQyQI0AAOICEICIgEEgIRIUvEMDMICawYjAzWHHhCVnAZZ0Q0YfE9AYILxHRH0jTut6pvV2dtAOISUlyF7oohZQDQWoAOJiVBMeb4zxY0+Ob4uH+9/vPEiNzSeg8EE7w6rwweQQYbP8SJ0JEDgSQEDExCERFYRMRFUBQ/F68ToqAEACF76XXK2alFFRIgbwCeMyAAQSvMfGzjtwTGrrjgWkPvFf6rAlJKKSAVMvOoK0BYO9mnpECoQUWABJtCfXq51+Nk6UEEV2gPDVJhRQkEEheAIEFQQhETEwkRGAQo6DBgwVNVLjl3QJgl+s+8XMhAaEALAERk+IQQ4c0RARuwG0Tkk4SWmaVfWzFcUV3IaAEEjwcrcLwAkAbFNZDSn70pM6Tjiam68TJ1ezxdBVScDkH5CFgWBZmAhEx0a4CBAFlB8Dg1xd+ISIizOxEhJRWSkUViAh2wH4gkOXk090PTnrwmcFWYTgBgYaNxi8ESoKf1j7tC0R0IxNfpupUDHlAsiJgWCJiQjF0wyChDA0Atr8XUHAhQuIIBPZY6ToNl3UQkd+y8G3pN9LLVs5bmdsOBBp61zC0AEiCMX2HqT/+qePPZ+bvENEcDjNcxgEOhsFMTLxbgQwnAAy6HlKwUiSkdJ0mVgyTNetZ+OfZvuxvVpy+YqC0oxnKGGHIABBvj+tScDd19dSzmflfSNFFrBkyIAKCIxRc+qcKZLgCoPh0CQSBWAJBh7VSIQWTNRtg8YOlU5feVYpxUomhcQs0JOYeEBBkykNTjuZ6/i4I16uQIpd2DgRhYrXPgjoEAFC6RkQcAPHCnuIQw2XcMw7uX5ceu7RjqNwCV1vrQXAgYMqTU76FeqyjCH1FAoFJGwsCE5HCYboK4SopkzMu35u37PMXlFLtiY2JOy/vuvzIFKVsUpIMqZ5iVucPJYtAa4Wb9PikJtL0ExVRX5SMAAaWmNSumnc4WoBBQChZQ0sg9kf6ZAbMu+LklvuPvf/ualqDygOgDaoU5E1aNenbUPh35amQG3CWibmYkcFnEQCl68WJ1b5WKqrgMm5J/v38zQ+c88CWwXHSoQmAdmjMhJn0wKSjXMzdpiN6nks7kJAl2qH1n3UAAAAcBAQXHhlWwUDwJhm68b4p961KSpJb0SqVChC5YsBqg8JMmPGPjD/PxdxzKqzm2T5rijd62Pr5A35gTERMKtedM8Q0kXxaedXrV/1zK7U6ECQpST40LEAhgCEQ3PjHxn9Teeo/CKQkL4aY9B617DNuAQa/VkQcMSE0IsRBX7AkvS39X1ecvmKgEnFBeVGVBKMQw7rxj43/iapTP5NAWPLiiEjX9HzfdwsQUH5b3nj13tWxMbEnEy8mPp+ilE1IQg1PCyBgENzkRyeHcsgtUvVqgfSJISFVSuZ8qpbVLMBurxcRE2oIaZu3m/L9+YuXTl+6vpzBIZdT+KN+M6ohR7lHOcYLXI8zAPSOp1FbB2gNdL4nb1nz0X7Mf+rqDVef3jmz05RIKEMPgKLwj2k7pjE6JvooR/g81+MMCDWTXy4QKFImbSwRHaHq1KqWP7ecUy4QHBwAkgXhj35wdH2uPreCI3yO7bOGuObvKxCuK5u1ViAjdZ1e0fLnljM6Z3aag40J+CA0n7AQmPzo5FBYhx/gCH/B9TpTC/Yq6g6UzVhHoBFe1HsksSFxYopSNtF24CDgA8ZjBxQILm3Td1GMzne9LgDXzH4V3AHbjLWseKwX9VYkXk18PtVSPEOoGgDaC0mezz34uR9yjK9yvS4AwauJp0qLoUzaWB3W472Q92DilURsUA6mwgAopnfHLR13o2pQ33F9ztSEPzQgyPfmjV/vn64j+u5WanXxjrja3639/gGgmN49YtkRf4sIfi4DYiG1tO6QuQMmnevOBeGR4cuvee2a7xZ3BqoyAEiCsR4yrm3cWPhYAoInVoo869oaus0B6XxP3nj1XuvVr159UefMTrM/QeG+A2A6CK1wVtlfcoTHS04MqLqEktraPQacdeyMExVWd16/6fpxqUTK7WtQuG8CLJ7pj1029iZu5EulT2rbveG1PWSXdc6v84/I2/wvQZAudFF5ACBgtMCNeXjMsfDxI8mKBWp+f1gGhT15Ex4Vnn/d69fduK8HR3sHQAoEQBDg/7LPUQRALb8/LIMBgMBBf+DY4x9c9Zerjkph766A98X0j0qNuoFjPMulnamROYa3HZC8iI7pRsXqZ/viCnhvUX9seWwMefR9yYurBX2HhisIegIbaghdfu0b187fmyvgvUX9oXzouxzjsZIXB9QAsN9LIAKxAIyIWJHC/wEYgVhIZbh+zjhh4h/+42v/GJqGabKnLCHv0fQn4EbfP/o4ePi69Iurmf4DELyIJUXk1XnKb/S13+Arv95XXr2n/UZfe3WeIkUkUmYgEJQZMC40MnRct+7++qAs4SeW/pQ3EVkqCznCIekXy8Q17d9X2YtY1qy8mKdMnxkwA+Z3BmYNgDcB9DNxPRyOAWEGMZ0VGhEKmz4DZ50jprI8Z2IikzYCwi1ff+Prd99+zO29JES7sov1HgI/N2LpiJPh4UpJizucq3XKLnwn1q/3lc3Zbjtgb7Vsf/3wcQ9v2tP1F79y8WRO8w1Q+IYX8ept2toyWVu2eWvCo8JHDnw88A9E9IN4e1x3YmcqGe0p8h+RGrFENair0F+s3EGFeXeHByfQeA2ethn7pDX2podPePh1AEgmk9zR3PEJzR7cU+iaP19znNHmdq/OOzfoCSzxDqXbFw7hbvmHAqdCimzevu/H/Kl3jrmzv2Tdd28BCvQuO2bZmCmW7eUyII6IaqZ/33y+8Uf4OugL7n6o7aGvohUuLnHdvLDZtba27rF5VDKZ5I6FHXwv3fvnptubZk0+f/Iiv9FP5HvyO4HgAGMBdjlnQyNDRwbbgmsxFrfvagVod9rfuLTxpyqmbkY/DBHpPWlDzQJs18bAH+l7QW9w7/Lpy6+FgJJIUiu17nPHsFLnkEQqwXQqrdZRHTf9xoKgDtgCFP5vdVizGTAbIkdHTrkDd5jBFoAHIZjQAtu4qHEkga6TjKCW8t1nzfdyPbmHlrct/1JSkpxcuH/CBwrdz0rNIiQnX7ZZ200e0UHvDgQqGAjEr/en5d7KzQZBBucFdgCgoyhsH1dSHY2Bga2lfPca7RfMfm+wKoJICxZCWhe2orW19YB6BaZaUjbeHtepE1KbXd79yKvzGIWqwYNKEROTIyYRyNcAYBqm7cYCNBcqeCH4Cmw1K9QPYeE3+jroC57OvJO5InVCKkgiSQfbKLK5o7lUPXlHviffQ5pUGXIEKp/OA4TZ1268dkIrtbpksnBGwIOCP6lL1U0nj2ZItmb+92b2vQZPm7R5vndr7yVPXPhEOin7b/Z3t1pbW10ileDUlNRWAE/pqAYIB1sPSGLFhhpDEaXUAgAo7Uq4aP4ZABSpBYhAQWBrUt6z5uuY1jZjXw4+Ci7qnNnZnZQkl0P4pbUlsYUgIHL0DHF5TDGByAUOECSKALA7ANBcNPqCS2vHvXtezjmr67R2WfcX1+Pmrjx35dZEW0KVU/gAcASOEBDEKfe6M273+ZoDSA8HA4Ew8+k3bLxhKhFJUpKsS9U9sWWx40nRScjV6vf3lOHz6jwledk8sG1gzuovrn6n0m1cyFAfHCAiZaFeiogNNYZ00BfMAfAqAGY0F6wAWbqAoqSLp1W1tcuDUxGlnHEf2Kyds/qLqzdWo4ePJRsu5kjKclBEIBInECtzS0aNsbUQYZLQLLia+d+N5jsVUgqCj23azn206dEN8fa4rqTwt3RsIRRqQsez5kLYWZ7glU3GAIQzE68kRrVSq2O0wOJx1AE4U/JSHn9zuPh8cU75igXSZzJm/sozV75YjcZNRzQfIQBEIDPKKg0C2cA6HdUjo7HoqduDwIaehunw8TkEENRIHyWz75RWBEbW9JnLHm96/HfVED4ElELKJTYnIgBmmYxBOWVCIKdCCg7u7B1vzGii0I6WpjXhiyNNIEU2yARXPnHWE0/FpQrCBxDviCsQBANY4Df4R7mcs2VWShIjIKIzgeJpoHPudAVVXfdfICk5Ednu34iIikmpoUOhQEgRWDOZfnPtkzOefCQucT14Kkgltb8Zze6I546IEFPS5Z0IpNzFV2TzFiBMu37T9WEu2oVpYgWojvm3ACxpIo6wUjGldb3Wql5pjrAiTVS6ZiiEDwWnQoptxn71iRlPpJrWNnlVET6AOOKFnMJo/Nhr8CbbrC3/cTyhlBD6PBMfoxsXNY50cBMRoLIBYCGfLRxlRUyQtHRbZ7tI6C1i6gchxuAJAKbpmB5BQnADrrQvoaoIn+F0RCvTZ2568own7ypqflAV4RetzJUbrvy2V+/dFPQGlWqzQ8440REdMnkzVQdeMEGJGgNbuS2giDjyiNlnkpx0ALjDaPPUplmbPtj12mnt08bZtD2PFH1d1ak48oCYChNTCmbf6pjWQW/w7dVnrL6tamZ/kPAXrF/wD16D9yPTb6yIqErV3RKRY48V5WiaZscTKUy6OIaFKiB8q6JKkaEtLu/+28bZGxcP9nlIgROJBFKpFJCA66Ku9wEsBrD4hM4TriOmn6iIGusy7uAZMnvWfKvrtTbbzHdXz1j9H9UUftHFBFd2XfllHdO/sAPWihMmroz0d9JxwrFMREej0Fag/PPuHBxHWUkgXRTQ2Rsv2LgYAk5IQkGKsxRaYFOUsmgpDH6CgOLtcQ0BvxJ/ZZHJmHOccRtUTClxYirwRKzX4OmgN/j+6hmr/61ImbLV0vx1p68LLn/l8is5zL82WeOcdRUPggVCYgUkdDQLyVEV+nOOQsTI4y0zYC54fd7rb+B2eCC4FKXsHpsfE6RzZqcBwTXd3uRtmL3hL7mPcrNczm1QMaXhyhocGq/R00FvcOtTpz91S7w9rjubO201JneUrMwV66+Y50W9e8UIxAmq0W+BQCRWIJAjGcC4ct+uQEqEEmOz9rq3L3v7XbRD40bsV0C17sZ1QTwZ169e9uq7rs/Ndjn3uqpTStzBn1eISEH43cF/PnX6Uzcn2hKqasJvL/r8lxc064i+X5woZ51Uk4DrrAOA0QxgbPGWy9k21nKM2eXcrzZfuvnZUl+hA3mrztZCx4uX5738VzfgZru8e1NFDxIEgqDI4F3cfmb731dzZk8pm3jZusv+lqO8XJxEbGCrKnwQqLjtH8EQjCjzbQsxKTfgsgjhhxAQmg8uvki1FAoc/3ThnzaJkdli5K8qotSBnFw6ccZr9Lx8X/7Bjoc7/i4pSa628C995dJTVKNaAaDe5uyQUe+JiBmEyKBkXDnMv6MIEQye3nzB5o1YWGgdf7Dvm6ICYfKl5pf+4jLuQrHyngrvHwhExPgNvjZ9ZtWHGz+8qkTirIbwE5JQnTM7zfw/zT9Oh/RjrHiUzVlLamjrLhhAqJCiKZMLKKZSBfIUACrxDcqxSv1xX5r1UpfN2LniZCuHWYkTty/C9xo8HaSDp/1t/hVdLV0F7lMVpn2XuAMXv3Tx0X7If5w1jzMZY4dDyR2j3OTPkn9R6AIgJb5B2UFw/kt/tFk7T0S2cZgZbs+CFBGj67U2GfM89/N2EmdFtr67Cr+tIPxL1l3yN17UW6lCarwZGB7CLwGg/CGGASD4uFIfugSCF2e+uNZl3DyB9HKIuTiX75PCj2lts/ZlGZCKkDj3tJKS5FRLys5fO3+MrtePqbCaYtLGVCShdRAAsBWAAMRJRX1bCQQvzHzh9+jHxQDS7O0MAuec1VGtbdb+xWXdnGfOfaYiJM49Cb+VWt2stbMadZ1+VIXVSabPDLs2+gwgV2wwVC5TLVAAgcYBAMZWLqtVAsHz5z//W5dzl4KRZc0kIg4Cq6NaiZHN1ENznvvCc+8mJKGqMae3KHyZv3Z+NFYXW+7FvDMqeLhzkAAQZMqafCoGgQQ6pRo30Dmz0zTd3uQ9f+7zq+2AvQIMQ0xgn5Uz7oOgP5jzzAXPbKzaWNYkuBWtkmhLeDqql/n1/rn5nvywnaHAIHSXVUcZJIEAwGwAO0rOKrjW3bguiEtcr21e+5gMyJUcYhYnvTIgc9c0r6k4iXMQ+Cm5MAksBAXTgyVeg3dhrjs3bJtqiohjAFuLACgP9VhIuYwT8um0iY9PnAGgUHZeaUtABXewpnnNcpuxV9usvfx3zb+rComzJPxEKsGt1OouverSu71G7/J8dz4YlsIvWmkA3RrA+2X30gRHHik34BaCMBft1aF4dc7sNBDwGlpzX8kcV034KJR2X/zyxXf4Df51+W15Ax6+bfRZMay1HzEJvV2BPJhyA86qOjVnwvIJX8VMmKbbm6rzMAgu0ZZQEHA1kjwQULwjXkj0/Onin4ZGhL6W684N66FZAilYAMa7LCKbYFGoEC5fLgiQQnsSjvL/mbhi4rnrblwXoL06DyXVkrLVSPKUhN85s9PM/+P874VGhG7O9+QL4/KG8SJQAQCCN9mxe1PyYsrOBiIQDAgOEQ7zQxMfnDgDM2GqBYJqrDi2C/9/+iP9W/K9eQOBGs7U+sGtBkjoNfYC7y0QPoTa5bflAQG7wDkQRnCMHxm/fPxphwsISoSOi/540bf8Rv9/BX2Bgas2t/6Ao392gYNzbgP3XNezTUTeLIqk7NEAEbHLOUtMo70677FjHjnmxEMdBCXhz3tx3o1+zP9J0B9Y2END+ACENZPJmZwX8v7MRSGtJ00AKuM3iUi5rLPEdASH+PEJyycch5kwh+K8oVKdwLx18/7Oi3m3mYyxsENczLKfPoA9BoB3TM5sKpSekqxDBTzAbkGg6Ugv6q2a9NCkySAcUkOnSiTOuevmLtB1+i6bs06scCXY1JWEgPIVAHTddfRd2UKfGMfrJCsgkKokCEBQLuMse3yUiqnHJ66YOAGEg5p8WW2zP/eFuXN1VC8RIxArh2I5vZAmiMgfgOJxcG9j73oE+AAeqFJuYFcQwMcxftRfdezDx34+1ZKy1cgWHrDwiyTOOS/MiauIWipWlDPVJXGW0wPYnAWDnysAoA0KFyINwhryqSKB4G5BkHaGfJrCdfz4hLYJ49CCYQmCUir5grUXzNBhvRyCyKEqfAhEeYrNgNkWUPBCAQBjt58EPAmucCCwc0ygXb8zHOLpkTGRx6YsnzIGLbDlTEiVTfhrLjjFi3iPAGhwOXfo9k8mOB3RINCaxRMWb0tKkhkdBZPv2D0haTHVpCoRk7Z91nCET+EYPzp+xfiRILjhAIISiXP2s7OP01H9GDOPtjlry9XPf4gMgBTbzq0s/ogL+XIB9S/ofxUOf0QYpfLs6oGg1xoVVWfU1dWtmPzo5IahBkGJO3Dh7y6cyA28kr3hQ+I82J1Yvi8faKUfK/7IlRpFKhBESJZDV88NbF8MbXqNUVF1th/xlzctb4oOFQhKJM4L1154JMVopfLVBJM2djjx+A5Q/a0X9UicrP3Vf/nVayJChSZRAEqFG1bsUmRgh6JPIDFp02OMiqp4tj774IT2CWGUanertEokznh7fIx4spJ9njrcSJwHY/7ZY4iT+wGguaNZbd8GguCQBKcT6fUSyO8pTMAQdOggJm36TKBi6oIYYkub7mgq2KNk5UFQInHO+f2cBn+k/4iO6JNMvxnWx7r7tfdXpHI9uYwVu7QIALcDAAUrUPi/wq8LDmHI/JRnuo3RMT0vOzXbhoXFXUolQSDgVmqVs547K2JDdrmu02cGfcHhNB/Z+nU+IFi1+JjFbyUlyaWW9p9sF5/FUknLh9BQVY8FBluCXhN4Me+yE5tPvBetECwEKtLEvgAsaVrbpGPh2DIVU3HTYw4f4UuBou+cIwL9EgAGTxPlQXtEQRtUz3U92yC4hyJD4wYGfR7P9JhANaiWEztOvBsEl0SSygqCEokTwAgesUTX6zmm57Ax+6XnaHVUU74vvyE0IbQKAhpMkN3ZrCYKGq9Z/0IykgMXWQJD8rmpAIJuY3SD/tLJ7Sf/ZysVeumXBQSDSJznrT3vN169d0XQEwSHlfABwAE6pImI/vcddEew6wBJ3jVThDaoD6/48DWxsoyiRJAqUKs+PSbQptsY1ahuOKn9pNtSLSmbwEGCYBCJs/kPzXfoRn1dvjtvgOFL4jzA+3QcYs51595zgbsHAups3rn9De9RATW+LzmxQ37USUUQ9BrjNXo3ntx+8s9SlLLxjrg6IBAMInHG18R/6o3wvnbYmf1B+u/VeSQkP100ZVHv9i6knwqAwqEMd1/a/SfkkaI64uHQQp5kOwi+eWrHqT/snNlpsBC0PwdIibaESiJJnTM7zblrzv2eN8K72fSYYU/iPFDtV75Sue7cuyNjI28TkU9o/54tQKLQrYs0LZSM5IiJBCJDbglA2vQZoxv0d057+rRbS4BNSEIVqeC0W3PfllClusBWanXxP8R/7NV7t5hec0iykvZJ/iKi6zSJle/9fMzPe5s7mne7ud+zCS0OkRyVGvVjNUL9k/SJISY95IMjURyGWK+VZKXDWfedF774wrpdgzsA2LX1yzkvnHOyEvUjHdGzTJ+xTKzKPDp2X4c5fvI9dnnt/l6/02tBVkc1BwPB+vxAvmna9GmmlVpldwE97WV/jIbpDSM83+tizWNhAALxcJgcCsDqOq0kJ4aE7ofDImfd79fNXPfh4Ns465WzRnlp7wwn7kvM3KIj2jdpY5lZVWB28LABgBfzVJAO5t5z9D0rP60w9tODqJIVWDrqq7pe31k8LtbDZXQsAMtgpes1xAokIx+B8QYJfUxMwsKjQThGRdQY5SvYfgsILBGpCg2PHnoAONjQyJDK9eSWLTpm0YK9VUV/evBTZOl8vODj/zdm2ZhrVUzNkrTY4TJUikAKgJg+44iI2OPR7PNo5gIo2TGccXAZ51zWCYP5cDjY+bSon3yifDrfDQ83Q0CDp4Tubu09v15IDhEpusnl3QA0aKhSxHtOFZACgSUQsRlrTdoUvjLGSiACAhevOXynYRQ8vPNiHru8++dFRy36awKJvbbC4X1QM4c28NZLt76OPL5DEapMW5kymQQCqcFfn5khWA7Wb/R19uPsisWTF9+xrw0x9u2ErQUWSeitV2z9het1D1I9aRExqK3hsuVzKqw4SAcfCMnf74vp3z8AlDCWBGutv+YybjOHWA91mri2CvJnxY4Ukc3aG5ZMWvJB6YyjvABohcN00HuXvPchcrhKRAJSJCIiNRkMqfZbv9HXQX/w3Xun3vtovD2u96cR1v6RLFpg0Q69ZcGW37uc+wZFSZVhsnVtHajwnZjQyJDObssuu3fKvf9WpLHvlzz2n2VTrOzdcvmWO1yf+yE3sIYgqIljCIK+Bl/ne/NrVVR9OSlJLub6pbIAKIDAoh36/Uvf/++u1y3hRvaAGgiqKXxdp5XN2reCfHDZPUfeky7ugvbbHR8oz06KI+f5vex717s+t4rr2atZgiqYfSuuOMh6a5AO5qempt45mO6nB060pCJPrwWB/dhe4Qbcb7mevdr2sLIBn45oFki3HbDz2qa1vXKw3U8PjmlbrCr64MsfpEP9oUvcgHta1StdkeFOn3npw+qwVgC2mbSZv+T4JWvL0QDz4KnWxQqejS0be3Ibc/Nsxq7iEaxrMUFZzX7h5FPkA5u2s9uOa3u2XA0wy8O1L4Jg6ze29odfC1/i+t393MAeADPMzg0ORbNv/EZfucC9kevPnV/S/HI1wCxfsUWxuuj1b76ef3vu2wnX737CMdbFkvNaxnD/BS8QmNDIkDYZ81x2IPvFpdOXri9VLZfr75S32qbUmVPAm+du/iebtjdDw5JPXAsO90v4DgCKk83ute/bWQ9Me+C9SnQ8L3+5VaF0Q9AGtXnu5lslJ7MF8raqVxpScwn7YvJ1WLMKKQQ9wf+4b9J916bOTmWSkuRKdDyvVL2dlNLGb81/q131qLNd1j2i6pUGgyC19PEnHpgTESc2NCKkxckmm7cX3jflvh+UyK6VmnJS+bPyIq0MACatmvRtKPy78lTIDThTJGXSgVLCtv+jT/68rHS1ClPCxInVIa1UWMHm7GLplm+lTkttrUar++qQJUqVva1wkx6f1ESKblVRdbZkBDCwxJ/k6H0WAACBJRD7I32yGfuOWLkldWzqN8COLiWVFk11+HGdEHRC4u1x/eKsF9/5OPPxXaNPGd0NwhkqpuokLwLAEe1gHJcDAJ8qwCEEAAqt+Jxf5ytSRDZv70xn0lc/dPxDzyXaEqqrrQtd1FWVnVP16VJSjAIAOX718RMs2SSDv6LCilzaCQiuxNc/3CxAMboXL+wpDjFsxj5NQv+ampLqrKbWDy0Aimuwf5u6curZHOJ/IUUXsceQAQFQMI/bbcIhDACBWAJBh7Vin2FztouEfnD/sfffvV3wqM784mEDgO2xwXRQKUictnraeWB8m4jmqaiCG3CAgynSufmQAkChu5ElIaXrNJEi2KxdD8Gt6iP1m9TZqUypiqkao+yGJwAGu4WFOxJJxz91/AzF6iYiWqCiKoYAkKwUHigRD65OGlYAEBIhcQQCe6x0nYbLOAjkt0rUL/rf6H9g5byVuaEy98MXAIO3jOshJSCc9PhJR0tEroHgGuWpE1RIweUckC9oFwszoRA6DhEARESEmZ2IkNJK6Wih1sZm7AcAHmLiu5cdt+zZ0i0Opbkf/gAYZBESqQRtN41tUCf/zcnnQnAlgS5UWk1SYQUJBJIXQGBBEAIVggYhAoPKDgAhAcMRqFA9zaQ4xNAhDRGBy7iPIegUlqUsvPLBaQ9+VLyfQkOKYST44Q2AQTFCvDm+0+i3eHs8nA6lZ4iTOeLkfAKd6MW8MHkEGGz/EidCRA4EkBAxcUGMBXdBuxW0kBARiEiKIJHtr1fMSisoX4E8AgnBpA0AvArgWSZe5Uf9ztTRqfcHaztSxSFWw3QdKlUzlGhLMBLArn6z6emm8QxuEpIzGXwKEU0BcKTyVUR5CmCAHAGy43tJB0mKACjGEMwMYgIrBjODVcGCwAIu6wTAViLayJpfJNAfWPG67ve7NwwGaFKS3IUuGo7afigDYLB7oEQqwVvGbqEiBXqnh9y0tikacqGjJJBjAUwlpokAJhBoHBGNJFADgCgThwjFSmciC0IeQIbB/QC6SdEWAm0mobeUVq8aa960IfvG6mmrP9rdlhYAOps77aEg9MHr/wNiYQe7gr+dqQAAAABJRU5ErkJggg==';
const ICON_NOT_FOUND_PNG = 'data:image/png;base64,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';


// Permanent verification QR supplied by the app owner. It is embedded as a
// compact, colour-adjusted PNG so PDF export remains fully offline.
const REPORT_QR_CARD_PNG = 'data:image/png;base64,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';


// ====================================================
// BUILD REPORT SCREEN (In-app visual report)
// ====================================================

function buildReportScreen(session) {
  const houses   = session.houses || [];
  const found    = houses.filter(h => h.larvaStatus === 'found').length;
  const notFound = houses.length - found;
  const rate     = houses.length > 0 ? ((found / houses.length) * 100).toFixed(1) : '0.0';

  const container = document.getElementById('report-container');
  container.innerHTML = `
    <!-- Report Header -->
    <div class="report-header-block">
      <div class="report-title">🦟 Mosquito Larvae Survey and Risk Assessment Report</div>
      <div class="report-meta-grid">
        <div class="report-meta-item">
          <div class="meta-label">Zone</div>
          <div class="meta-value">${escapeHtml(session.zoneNumber)}</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-label">Area</div>
          <div class="meta-value">${escapeHtml(session.areaName || '—')}</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-label">Vector Collector</div>
          <div class="meta-value">${escapeHtml(session.workerName)}${session.workerDesignation ? ` — ${escapeHtml(session.workerDesignation)}` : ''}</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-label">Officer</div>
          <div class="meta-value">${session.supervisorName ? escapeHtml(session.supervisorName) + (session.supervisorDesignation ? ` — ${escapeHtml(session.supervisorDesignation)}` : '') : '—'}</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-label">Survey Date</div>
          <div class="meta-value">${escapeHtml(session.date)}</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-label">Stegomyia Index</div>
          <div class="meta-value" style="color:${found > 0 ? 'var(--not-found-red)' : 'var(--found-green)'}">
            ${rate}%
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="report-stats">
      <div class="stat-card total">
        <span class="stat-num">${houses.length}</span>
        <div class="stat-label">Total Houses</div>
      </div>
      <div class="stat-card found-stat">
        <span class="stat-num">${found}</span>
      </div>
      <div class="stat-card not-found-stat">
        <span class="stat-num">${notFound}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="report-table-wrap">
      <div class="report-table-title">📋 House-wise Inspection Details</div>
      <div style="overflow-x:auto;">
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Address</th>
              <th>Status</th>
              <th>Time</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${houses.map(h => `
              <tr>
                <td><strong>${h.number}</strong></td>
                <td>
                  ${escapeHtml(h.address)}
                  ${h.notes ? `<br/><small style="color:var(--text-muted);font-style:italic">${escapeHtml(h.notes)}</small>` : ''}
                </td>
                <td>
                  <span class="status-chip">
                    <img class="status-icon" src="${h.larvaStatus === 'found' ? 'larva-found.png' : 'larva-not-found.png'}" alt="${h.larvaStatus === 'found' ? 'Larva found' : 'Larva not found'}" />
                  </span>
                </td>
                <td style="white-space:nowrap;font-size:0.7rem">${escapeHtml(h.timeDisplay)}</td>
                <td style="font-size:0.7rem">
                  ${h.location
                    ? `${h.location.lat.toFixed(4)},<br/>${h.location.lng.toFixed(4)}`
                    : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div style="height:20px;"></div>
  `;
}

// ====================================================
// PDF GENERATION  (jsPDF + autoTable + Bangla font)
// ====================================================

// Generate and share the PDF through the phone's native share sheet.
// On Android, WhatsApp appears there when it is installed.
function sharePDF() {
  downloadPDF(false, 0, true);
}

function downloadPDF(autoMode = false, retries = 0, shareMode = false) {
  const session = currentSession;
  if (!session || !session.houses) {
    showToast('⚠️ No session data to export');
    return;
  }

  // ---- Readiness check ----
  // jsPDF 2.5.1: autoTable attaches to jsPDF.API (a plain object),
  // NOT to jsPDF.prototype — they are different objects. The old check
  // typeof jsPDF.prototype.autoTable was always false even when loaded.
  const jsPDFClass    = window.jspdf && window.jspdf.jsPDF;
  const jsPDFReady    = typeof jsPDFClass === 'function';
  const autoTableReady = jsPDFReady && typeof jsPDFClass.API?.autoTable === 'function';

  if (!jsPDFReady || !autoTableReady) {
    if (retries < 20) {
      setTimeout(() => downloadPDF(autoMode, retries + 1, shareMode), 500);
      if (retries === 0) showToast('⏳ Loading PDF engine...', 5000);
    } else {
      // All retries exhausted — try dynamically loading from CDN as last resort
      showToast('⏳ Trying CDN fallback...', 4000);
      _loadPDFLibsFromCDN(() => {
        const ok = window.jspdf?.jsPDF && window.jspdf.jsPDF.API?.autoTable;
        if (ok) {
          buildAndSavePDF(session, autoMode, shareMode).catch(err => {
            showToast('❌ PDF failed: ' + (err?.message || String(err)));
          });
        } else {
          showToast('❌ PDF engine unavailable. Need internet for first-time setup.');
        }
      });
    }
    return;
  }

  if (autoMode) showToast('📄 Preparing PDF…', 3000);
  if (shareMode) showToast('📤 Preparing PDF to share…', 3000);
  buildAndSavePDF(session, autoMode, shareMode).catch(err => {
    console.error('[PDF] Generation error:', err);
    showToast('❌ PDF failed: ' + (err?.message || String(err)));
  });
}

// Dynamically loads jsPDF + autoTable from CDN (fallback when local libs/ missing)
function _loadPDFLibsFromCDN(callback) {
  const s1 = document.createElement('script');
  s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s1.onerror = () => { callback(false); };
  s1.onload = () => {
    const s2 = document.createElement('script');
    s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
    s2.onerror = () => { callback(false); };
    s2.onload  = () => { callback(true); };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
}


// -------------------------------------------------------
// ASYNC PDF BUILDER
// -------------------------------------------------------
async function buildAndSavePDF(session, autoMode, shareMode = false) {
  const { jsPDF } = window.jspdf;
  // compress: true — Bangla runs are embedded as (highly compressible)
  // images, so stream compression keeps Bangla reports roughly the same
  // file size as English ones instead of ballooning to several MB.
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  const PAGE_W    = 210;
  const MARGIN    = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ---- Load Bangla-capable font. Returns null on failure — English
  //      text (via pickFont) is unaffected either way; only actual
  //      Bangla text would show as boxes if this failed. ----
  const FONT = await loadBanglaFont(doc);

  // ---- Prepare the canvas-based Bangla renderer. jsPDF cannot shape
  //      Bengali (conjuncts / pre-base vowels), so any Bangla run is
  //      drawn through the browser's shaping engine and placed as an
  //      image. English text is unaffected and stays real PDF text. ----
  try {
    await initBanglaCanvasFont(localStorage.getItem('_bn_font_ttf_v5'));
  } catch (_) { /* renderer unavailable — pickFont() fallback still applies */ }

  const houses   = session.houses;
  const found    = houses.filter(h => h.larvaStatus === 'found').length;
  const notFound = houses.length - found;
  const rate     = houses.length > 0 ? ((found / houses.length) * 100).toFixed(1) : '0.0';

  // ---- Colour palette ----
  const C_DARK   = [15, 23, 42];
  const C_ACCENT = [0, 212, 170];
  const C_GREEN  = [34, 197, 94];
  const C_RED    = [239, 68, 68];
  const C_GRAY   = [71, 85, 105];
  const C_LIGHT  = [241, 245, 249];
  const C_WHITE  = [255, 255, 255];

  // ---- PAGE 1: Header banner ----
  doc.setFillColor(...C_DARK);
  doc.rect(0, 0, PAGE_W, 50, 'F');
  doc.setFillColor(...C_ACCENT);
  doc.rect(0, 47, PAGE_W, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13); // reduced from 18 — new title is much longer, this keeps it on one line without overflowing the page width
  doc.setTextColor(...C_WHITE);
  doc.text('MOSQUITO LARVAE SURVEY AND RISK ASSESSMENT REPORT', PAGE_W / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C_ACCENT);
  doc.text('Field Inspection System \u2014 Generated Automatically', PAGE_W / 2, 26, { align: 'center' });

  doc.setTextColor(...C_LIGHT);
  doc.setFontSize(8.5);
  doc.text(`Generated on: ${formatDateTime(new Date())}`, PAGE_W / 2, 34, { align: 'center' });
  doc.text(`Session ID: ${session.id}`, PAGE_W / 2, 40, { align: 'center' });

  // Fixed owner QR: first page, compact top-right placement. Coordinates match
  // the approved mock (slightly lowered for clean alignment with the heading).
  try {
    doc.addImage(REPORT_QR_CARD_PNG, 'PNG', 183.8, 10.6, 19, 19, undefined, 'FAST');
  } catch (err) {
    console.warn('[PDF] Verification QR could not be added:', err);
  }

  let y = 58;

  // ---- Session info box ----
  drawBox(doc, MARGIN, y, CONTENT_W, 48, C_LIGHT, [220, 230, 245]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C_DARK);
  doc.text('SURVEY INFORMATION', MARGIN + 4, y + 7);

  const workerLine = session.workerDesignation
    ? `${session.workerName} (${session.workerDesignation})`
    : session.workerName;
  const supervisorLine = session.supervisorName
    ? (session.supervisorDesignation ? `${session.supervisorName} (${session.supervisorDesignation})` : session.supervisorName)
    : '\u2014';

  const infoItems = [
    ['Zone',        session.zoneNumber],
    ['Area / Ward', session.areaName || '\u2014'],
    ['Vector Collector Name', workerLine],
    ['Officer Name',          supervisorLine],
    ['Survey Date', session.date],
    ['Start Time',  session.startTime ? formatDateTime(new Date(session.startTime)) : '\u2014'],
  ];

  const col1X = MARGIN + 4;
  const col2X = PAGE_W / 2 + 4;

  infoItems.forEach((item, i) => {
    const col = i % 2 === 0 ? col1X : col2X;
    const row = Math.floor(i / 2);
    const iy  = y + 16 + row * 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C_GRAY);
    doc.text(item[0].toUpperCase(), col, iy);

    // Value may be Bangla (zone/area/worker/supervisor names) — pick
    // the right font per-value instead of forcing one font on everything.
    doc.setFont(pickFont(FONT, item[1]), 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C_DARK);
    bnText(doc, String(item[1]), col, iy + 5, {
      size: 9, color: C_DARK, maxWidth: PAGE_W / 2 - 10
    });
  });

  y += 56;

  // ---- Summary stat cards ----
  const statW = (CONTENT_W - 8) / 3;
  [
    { label: 'Total Houses Visited', value: String(houses.length), color: C_DARK  },
    { label: '',                      value: String(found),         color: C_GREEN },
    { label: '',                      value: String(notFound),      color: C_RED   },
  ].forEach((stat, i) => {
    const sx = MARGIN + i * (statW + 4);
    drawBox(doc, sx, y, statW, 24, [248, 250, 252], [210, 220, 235]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...stat.color);
    doc.text(stat.value, sx + statW / 2, y + 13, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C_GRAY);
    doc.text(stat.label, sx + statW / 2, y + 20, { align: 'center' });
  });

  y += 32;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C_DARK);
  doc.text(`Stegomyia (House) Index: ${rate}%`, MARGIN, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C_GRAY);
  doc.text('(Houses with larva \u00f7 total houses \u00d7 100)', MARGIN + 58, y + 5);

  y += 14;

  // ---- House-wise table ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C_DARK);
  doc.text('HOUSE-WISE INSPECTION DETAILS', MARGIN, y);
  y += 4;

  const ROW_H = 22;

  // Column widths (mm). The Notes column is the flexible one, so its real
  // width is whatever is left over — computing it here (instead of guessing)
  // is what keeps wrapped Bangla notes inside the cell border.
  const TABLE_COL_W = { 0: 8, 1: 20, 2: 36, 3: 24, 4: 24, 5: 26, 6: 22 };
  TABLE_COL_W[7] = CONTENT_W - (8 + 20 + 36 + 24 + 24 + 26 + 22);

  const tableBody = houses.map(h => [
    String(h.number),
    '',                                                       // photo – drawn in didDrawCell
    h.address   || '\u2014',
    h.larvaStatus === 'found' ? 'Yes' : 'No',
    h.itemType  || '\u2014',
    h.timeDisplay || '\u2014',
    h.location  ? `${h.location.lat.toFixed(5)}, ${h.location.lng.toFixed(5)}` : '\u2014',
    truncateNoteForPDF(h.notes),
  ]);

  doc.autoTable({
    startY: y,
    head: [['#', 'Photo', 'House / Address', 'Larvae Status', 'Item Found', 'Time', 'GPS', 'Notes']],
    body: tableBody,
    margin: { left: MARGIN, right: MARGIN, bottom: 16 }, // bottom margin keeps rows above the footer
    rowPageBreak: 'avoid', // never split a row across pages — prevents photos being cut in half
    styles: {
      font:         'helvetica', // safe default; overridden per-cell below when a cell has Bangla text
      fontStyle:    'normal',
      fontSize:     7,
      cellPadding:  2.5,
      textColor:    C_DARK,
      lineColor:    [210, 220, 235],
      lineWidth:    0.3,
      overflow:     'linebreak',
      minCellHeight: ROW_H,
    },
    headStyles: {
      font:      'helvetica', // column headers are always English
      fontStyle: 'bold',
      fillColor: C_DARK,
      textColor: C_WHITE,
      fontSize:  7.5,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },   // photo
      2: { cellWidth: 36 },                      // address
      3: { cellWidth: 24, halign: 'center' },    // status
      4: { cellWidth: 24 },                      // item type
      5: { cellWidth: 26 },                      // time
      6: { cellWidth: 22, halign: 'center' },    // gps
      7: { cellWidth: 0, fontSize: 6 },          // notes (fills remaining width, smaller text)
    },
    didParseCell(data) {
      // Per-cell font: only cells that actually contain Bangla text use
      // the Bangla font — every other cell (numbers, GPS, time, English
      // notes) stays on helvetica regardless of whether the Bangla font
      // loaded correctly. This is what stops one bad/missing font from
      // being able to break the whole table.
      if (data.section === 'body') {
        const raw = data.cell.raw;
        const text = Array.isArray(raw) ? raw.join(' ') : String(raw == null ? '' : raw);
        data.cell.styles.font = pickFont(FONT, text);
        // Bangla cells: blank the unshaped text but keep the row height,
        // then repaint them properly in didDrawCell.
        bnPrepareCell(data, TABLE_COL_W);
      }

      // Larva status column: suppress the default text entirely — it
      // must be cleared HERE (before layout/draw), not in didDrawCell.
      // didDrawCell runs AFTER the cell's text is already painted, so
      // clearing it there was too late and "Yes"/"No" was rendering
      // underneath the icon anyway.
      if (data.section === 'body' && data.column.index === 3) {
        data.cell.text = [];
      }
    },
    didDrawCell(data) {
      // Shaped Bangla text for any cell that contains Bengali
      bnDrawCell(doc, data);

      // Photo column
      if (data.column.index === 1 && data.section === 'body') {
        const house = houses[data.row.index];
        if (house && house.photo) {
          try {
            const pad = 1.5;
            // Cap the image height so it never stretches to fill an
            // oversized row (e.g. a row made tall by a long note) —
            // that stretching is what made the photo box look "broken".
            const maxImgH = ROW_H - pad * 2;
            const imgW = data.cell.width - pad * 2;
            const imgH = Math.min(data.cell.height - pad * 2, maxImgH);
            const imgY = data.cell.y + (data.cell.height - imgH) / 2; // vertically centered
            doc.addImage(house.photo, 'JPEG',
              data.cell.x + pad, imgY, imgW, imgH);
          } catch (_) { /* photo data missing */ }
        }
      }

      // Larva status column — small icon only, no text (uses the
      // uploaded check/cross PNGs instead of an emoji, which some PDF
      // viewers render as a blank box regardless of font)
      if (data.column.index === 3 && data.section === 'body') {
        const isFound = houses[data.row.index]?.larvaStatus === 'found';
        const icon = isFound ? ICON_FOUND_PNG : ICON_NOT_FOUND_PNG;

        const iconSize = 6; // mm — small and centered, not a big pill
        const ix = data.cell.x + (data.cell.width - iconSize) / 2;
        const iy = data.cell.y + (data.cell.height - iconSize) / 2;

        try {
          doc.addImage(icon, 'PNG', ix, iy, iconSize, iconSize);
        } catch (_) { /* icon failed to decode — leave cell blank rather than break the row */ }
      }
    },
  });

  // ---- Signature / Certification section ----
  // Always shown — if the table ran long (e.g. 15+ houses across multiple pages)
  // we add a new page rather than silently skipping it (the old `finalY < 250` guard
  // caused the entire block to disappear for surveys with many entries).
  const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY != null)
    ? doc.lastAutoTable.finalY + 8
    : y + 20;

  const SIG_HEIGHT   = 55; // approximate mm needed for the signature block
  const PAGE_USABLE  = 278; // 297 (A4) − 10 (footer) − 9 (padding)

  if (finalY + SIG_HEIGHT > PAGE_USABLE) {
    // Not enough room on current page — start a fresh page
    doc.addPage();
    addSignatureSection(doc, 20, MARGIN, CONTENT_W, C_DARK, C_GRAY, FONT);
  } else {
    addSignatureSection(doc, finalY, MARGIN, CONTENT_W, C_DARK, C_GRAY, FONT);
  }

  // ---- Footer on every page ----
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...C_DARK);
    doc.rect(0, 287, PAGE_W, 10, 'F');
    const footerText = `Larvae Survey App  |  Page ${p} of ${pageCount}  |  ${session.zoneNumber}  |  ${session.workerName}`;
    doc.setFont(pickFont(FONT, footerText), 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C_ACCENT);
    bnText(doc, footerText, PAGE_W / 2, 293, {
      size: 6.5, color: C_ACCENT, align: 'center', maxWidth: PAGE_W - 20
    });
  }

  // ---- Save or share ----
  const filename = buildPdfFilename(session);
  if (shareMode) {
    await sharePdfDocument(doc, filename, session);
  } else {
    doc.save(filename);
    showToast('📄 PDF saved!');
  }
}

// Shares the generated PDF through the browser/phone share sheet. Android
// lists WhatsApp here when installed. Browsers that cannot share files fall
// back to downloading the exact same PDF so the report is never lost.
async function sharePdfDocument(doc, filename, session) {
  const blob = doc.output('blob');

  try {
    if (typeof File !== 'function' || typeof navigator.share !== 'function') {
      throw new Error('File sharing is not supported');
    }

    const file = new File([blob], filename, { type: 'application/pdf' });
    if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
      throw new Error('This device cannot share PDF files');
    }

    const ward = getWardFilenamePart(session);
    await navigator.share({
      files: [file],
      title: 'Larvae Survey PDF',
      text: `${ward.replace('-', ' ')} larvae survey report`,
    });
    showToast('✅ PDF shared');
  } catch (err) {
    // Closing the Android share sheet is not an error and should not create
    // an unwanted download.
    if (err && err.name === 'AbortError') return;

    console.warn('[PDF share] Falling back to download:', err);
    doc.save(filename);
    showToast('📥 Sharing unavailable — PDF downloaded instead', 5000);
  }
}

// ====================================================
// PDF FILE NAME
// ----------------------------------------------------
// Format: ward-25_23-08-26_14-30-02.pdf
//         ward    survey date   current time to seconds
//
// The current hour, minute and second keep every export unique, so phones do
// not ask to overwrite a previous report or append "(1)", "(2)", etc.
// ====================================================
function buildPdfFilename(session) {
  const now = new Date();
  const surveyDate = session.startTime ? new Date(session.startTime) : now;
  const safeSurveyDate = Number.isNaN(surveyDate.getTime()) ? now : surveyDate;

  const date = [
    String(safeSurveyDate.getDate()).padStart(2, '0'),
    String(safeSurveyDate.getMonth() + 1).padStart(2, '0'),
    String(safeSurveyDate.getFullYear()).slice(-2),
  ].join('-');

  const time = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('-');

  return `${getWardFilenamePart(session)}_${date}_${time}.pdf`;
}

// Accepts entries such as "Ward 25", "Ward-25", "W-25",
// "Mohakhali W-25", plain "25", and Bangla digits such as "ওয়ার্ড ২৫".
function getWardFilenamePart(session) {
  const banglaDigits = '০১২৩৪৫৬৭৮৯';
  const rawArea = String(session?.areaName || '').trim();
  const area = rawArea.replace(/[০-৯]/g, d => String(banglaDigits.indexOf(d)));

  const labelled = area.match(/(?:ward|w|ওয়ার্ড|ওয়ার্ড)\s*(?:no\.?\s*)?[-:#]?\s*(\d{1,3}[a-z]?)/i);
  const anyNumber = area.match(/\d{1,3}[a-z]?/i);
  const wardNumber = labelled?.[1] || anyNumber?.[0];

  if (wardNumber) return `ward-${wardNumber.toUpperCase()}`;

  const areaFallback = sanitizeForFilename(rawArea)
    .replace(/^(?:ward|w)[_-]*/i, '')
    .slice(0, 35);
  return `ward-${areaFallback || 'unknown'}`;
}

// Strips characters Android/Windows/iOS reject in file names and collapses
// spaces to underscores. Bangla zone names are kept as-is — they are valid
// in file names on every modern phone.
function sanitizeForFilename(str) {
  return String(str == null ? '' : str)
    .replace(/[\\/:*?"<>|]+/g, '')   // illegal on Windows/Android
    .replace(/\s+/g, '_')             // no spaces
    .replace(/_+/g, '_')              // no double underscores
    .replace(/^_|_$/g, '')            // no leading/trailing underscore
    .slice(0, 60);                    // keep the name a sane length
}

// ====================================================
// BANGLA FONT LOADER
// Fetches a Bengali-capable TTF (local file first, then CDN), validates
// the actual file bytes (not just HTTP status) before trusting it, and
// caches it in localStorage. Returns the font name on success, or null
// on failure — callers use pickFont() so English text is unaffected
// either way.
// ====================================================

async function loadBanglaFont(doc) {
  const FONT_NAME  = 'NotoSansBengali';
  const FONT_FILE  = 'NotoSansBengali.ttf';
  // v4: busted old stale caches (previous versions may have cached a broken HTML 404 response)
  // v5: added GitHub raw + npm CDN sources + Google Fonts CSS parsing for the most reliable loading
  const CACHE_KEY  = '_bn_font_ttf_v5';

  function registerFont(b64) {
    try {
      doc.addFileToVFS(FONT_FILE, b64);
      doc.addFont(FONT_FILE, FONT_NAME, 'normal');
      doc.addFont(FONT_FILE, FONT_NAME, 'bold');
      return true;
    } catch (_) { return false; }
  }

  // ---- 0. Persistent cache (localStorage survives app restarts) ----
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      if (isLikelyFontBinary(_base64ToArrayBuffer(cached)) && registerFont(cached)) {
        return FONT_NAME;
      }
      localStorage.removeItem(CACHE_KEY); // corrupt/stale — discard and re-fetch
    }
  } catch (_) {}

  // ---- 1. Build list of TTF sources to try.
  //
  //    IMPORTANT: fetch uses 'no-store' (not 'force-cache') so that a
  //    previously-cached bad response (HTML 404 page) is NOT replayed.
  //    A bad cached response was the most common reason loadBanglaFont
  //    silently failed even when the CDN was reachable.
  //
  //    Local file is tried first so field devices (poor/no internet)
  //    still get Bangla in the PDF once the SW has cached it. ----
  const SOURCES = [
    // 1a. Local font bundled with the app (add fonts/NotoSansBengali-Regular.ttf to your project)
    'fonts/NotoSansBengali-Regular.ttf',

    // 1b. GitHub raw — googlefonts official repository (very reliable)
    'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf',

    // 1c. jsdelivr npm — @fontsource package (TTF format)
    'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali@latest/files/noto-sans-bengali-bengali-400-normal.woff',

    // 1d. jsdelivr GitHub mirrors (original sources, kept as secondary fallback)
    'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansBengali/hinted/ttf/NotoSansBengali-Regular.ttf',
    'https://cdn.jsdelivr.net/gh/openmaptiles/fonts/noto-sans/NotoSansBengali-Regular.ttf',

    // 1e. Alternative GitHub raw paths
    'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf',
  ];

  // ---- 2. Try to get the real font binary URL from Google Fonts CSS.
  //         Google Fonts is the most authoritative source for Noto fonts.
  //         Requesting the "old" CSS endpoint (without css2) causes Google
  //         to include TTF URLs (instead of WOFF2) for compatibility mode,
  //         which we can then fetch directly. ----
  try {
    const gResp = await fetch(
      'https://fonts.googleapis.com/css?family=Noto+Sans+Bengali:400,700',
      { cache: 'no-store' }
    );
    if (gResp.ok) {
      const css = await gResp.text();
      // Extract all TTF URLs from the CSS
      const ttfMatches = [...css.matchAll(/url\((https?:[^)]+\.(?:ttf|TTF))\)/g)];
      ttfMatches.forEach(m => { if (m[1]) SOURCES.push(m[1]); });
      // Also try WOFF2 decoded as a binary (jsPDF only reads TTF but we validate bytes anyway)
      const woff2Matches = [...css.matchAll(/url\((https?:[^)]+\.woff2)\)/g)];
      woff2Matches.forEach(m => { if (m[1]) SOURCES.push(m[1]); });
    }
  } catch (_) { /* Google Fonts CSS unreachable — proceed with static list */ }

  // ---- 3. Fetch each source and validate the binary ----
  //         Each fetch is limited to 8 seconds — a slow/hanging CDN must not
  //         freeze the entire PDF generation indefinitely.
  for (const url of SOURCES) {
    try {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 8000); // 8 s max per source

      let resp;
      try {
        // 'no-store' avoids replaying a previously-cached bad (HTML) response
        resp = await fetch(url, { cache: 'no-store', signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!resp || !resp.ok) continue;

      const contentType = resp.headers.get('content-type') || '';
      // Skip obvious HTML fallback pages (SPA hosts, CDN 404 pages)
      if (contentType.includes('text/html')) continue;

      const buffer = await resp.arrayBuffer();
      // Validate real font magic bytes (TrueType / OpenType signature)
      if (!isLikelyFontBinary(buffer)) continue;

      const b64 = _arrayBufferToBase64(buffer);
      if (registerFont(b64)) {
        // Cache the validated font bytes so subsequent PDF exports are instant
        try { localStorage.setItem(CACHE_KEY, b64); } catch (_) {}
        return FONT_NAME;
      }
    } catch (_) { continue; } // AbortError from timeout or network failure — try next source
  }

  // ---- 4. All sources failed — fall back to built-in helvetica (no Bengali glyphs) ----
  console.warn(
    'Bangla font could not be loaded from any source.\n' +
    'Bengali text will show as boxes in the PDF.\n' +
    'Fix: add fonts/NotoSansBengali-Regular.ttf to your project folder.'
  );
  try { showToast('⚠️ Bangla font unavailable — PDF may show boxes for Bangla text', 5000); } catch (_) {}
  return null; // callers use pickFont() which falls back to helvetica per-field
}

// Checks the actual file bytes look like a real font (TrueType/OpenType/
// collection signature), instead of trusting the HTTP status code alone.
// This is what stops a mis-served HTML "not found" page from being
// registered as the font — the bug that broke BOTH English and Bangla.
function isLikelyFontBinary(buffer) {
  if (!buffer || buffer.byteLength < 4) return false;
  const b = new Uint8Array(buffer.slice(0, 4));
  const sig = String.fromCharCode(b[0], b[1], b[2], b[3]);
  return (b[0] === 0x00 && b[1] === 0x01 && b[2] === 0x00 && b[3] === 0x00) // TrueType
      || sig === 'OTTO'  // OpenType/CFF
      || sig === 'true'  // old Mac TrueType
      || sig === 'ttcf'; // TrueType collection
}

function _base64ToArrayBuffer(b64) {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  } catch (_) { return new ArrayBuffer(0); }
}

// Bengali Unicode block check — used to pick which font a given piece
// of text needs, so English text always uses the built-in, always-safe
// 'helvetica' and only actual Bangla text uses the loaded Bangla font.
function containsBengali(str) {
  return /[\u0980-\u09FF]/.test(String(str == null ? '' : str));
}

// FONT here is the result of loadBanglaFont() — either 'NotoSansBengali'
// or null (failed to load). Falls back to helvetica whenever the text
// has no Bengali characters, OR when the Bangla font never loaded —
// so English text is never at the mercy of the Bangla font's health.
function pickFont(banglaFontName, text) {
  if (banglaFontName && containsBengali(text)) return banglaFontName;
  return 'helvetica';
}

function _arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

// ====================================================
// PDF HELPERS
// ====================================================

// Keep long notes from blowing up the table row height (which was
// stretching the photo cell and breaking the layout). Long notes are
// shortened for the PDF table; the full note is still visible in-app
// and on the on-screen report.
function truncateNoteForPDF(notes, maxChars = 120) {
  if (!notes) return '\u2014';
  const trimmed = notes.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return trimmed.slice(0, maxChars).trim() + '\u2026';
}

function drawBox(doc, x, y, w, h, fillColor, borderColor) {
  doc.setFillColor(...fillColor);
  doc.setDrawColor(...(borderColor || fillColor));
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
}

function addSignatureSection(doc, y, margin, contentW, cDark, cGray, banglaFont) {
  doc.setDrawColor(200, 210, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentW, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...cDark);
  doc.text('CERTIFICATION', margin, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...cGray);
  doc.text(
    'I hereby certify that this survey was conducted accurately and the data reported is correct to the best of my knowledge.',
    margin, y, { maxWidth: contentW }
  );

  y += 20;
  const sigW = (contentW - 10) / 2;

  // Worker signature
  const workerName        = currentSession?.workerName || '\u2014';
  const workerDesignation = currentSession?.workerDesignation || '';
  doc.setDrawColor(180, 190, 210);
  doc.line(margin, y, margin + sigW, y);
  doc.setFont(pickFont(banglaFont, workerName), 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cDark);
  bnText(doc, workerName, margin, y + 6, { size: 8.5, bold: true, color: cDark, maxWidth: sigW });
  if (workerDesignation) {
    doc.setFont(pickFont(banglaFont, workerDesignation), 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...cGray);
    bnText(doc, workerDesignation, margin, y + 11, { size: 7, color: cGray, maxWidth: sigW });
  }

  // Supervisor signature
  const supervisorName        = currentSession?.supervisorName || '\u2014';
  const supervisorDesignation = currentSession?.supervisorDesignation || '';
  const sx2 = margin + sigW + 10;
  doc.setDrawColor(180, 190, 210);
  doc.line(sx2, y, sx2 + sigW, y);
  doc.setFont(pickFont(banglaFont, supervisorName), 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cDark);
  bnText(doc, supervisorName, sx2, y + 6, { size: 8.5, bold: true, color: cDark, maxWidth: sigW });
  if (supervisorDesignation) {
    doc.setFont(pickFont(banglaFont, supervisorDesignation), 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...cGray);
    bnText(doc, supervisorDesignation, sx2, y + 11, { size: 7, color: cGray, maxWidth: sigW });
  }
}

